use rusqlite::{Connection, Result as SqliteResult, params};
use std::sync::Mutex;

use crate::types::Project;

pub struct Database {
    conn: Mutex<Connection>,
}

#[derive(Debug, thiserror::Error)]
pub enum DatabaseError {
    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("Project not found")]
    NotFound,
}

impl Database {
    pub fn new() -> SqliteResult<Self> {
        let db_path = Self::get_db_path();

        // Ensure parent directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(&db_path)?;
        let db = Self {
            conn: Mutex::new(conn),
        };

        db.run_migrations()?;
        Ok(db)
    }

    fn get_db_path() -> std::path::PathBuf {
        let data_dir = dirs::data_local_dir()
            .unwrap_or_else(|| std::path::PathBuf::from("."))
            .join("envault");
        data_dir.join("envault.db")
    }

    fn run_migrations(&self) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();

        // Create tables if they don't exist
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                path TEXT NOT NULL UNIQUE,
                icon TEXT DEFAULT 'folder',
                icon_color TEXT DEFAULT '#737373',
                active_environment TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS environments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                is_readonly INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                UNIQUE(project_id, name)
            );

            CREATE TABLE IF NOT EXISTS env_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                env_name TEXT NOT NULL,
                activated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );
            "
        )?;

        // Migration: Add icon and icon_color columns if they don't exist
        let has_icon_column: bool = conn
            .prepare("SELECT icon FROM projects LIMIT 1")
            .is_ok();

        if !has_icon_column {
            conn.execute_batch(
                "
                ALTER TABLE projects ADD COLUMN icon TEXT DEFAULT 'folder';
                ALTER TABLE projects ADD COLUMN icon_color TEXT DEFAULT '#737373';
                "
            )?;
        }

        Ok(())
    }

    // Project methods
    pub fn insert_project(&self, name: &str, path: &str, icon: &str, icon_color: &str) -> Result<Project, DatabaseError> {
        let conn = self.conn.lock().unwrap();

        conn.execute(
            "INSERT INTO projects (name, path, icon, icon_color) VALUES (?1, ?2, ?3, ?4)",
            params![name, path, icon, icon_color],
        )?;

        let id = conn.last_insert_rowid();

        let project = conn.query_row(
            "SELECT id, name, path, icon, icon_color, active_environment, created_at, updated_at
             FROM projects WHERE id = ?1",
            params![id],
            |row| {
                Ok(Project {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    path: row.get(2)?,
                    icon: row.get(3)?,
                    icon_color: row.get(4)?,
                    active_environment: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        )?;

        Ok(project)
    }

    pub fn get_all_projects(&self) -> Result<Vec<Project>, DatabaseError> {
        let conn = self.conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, name, path, icon, icon_color, active_environment, created_at, updated_at
             FROM projects ORDER BY updated_at DESC"
        )?;

        let projects = stmt.query_map([], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                icon: row.get(3)?,
                icon_color: row.get(4)?,
                active_environment: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

        Ok(projects)
    }

    pub fn get_project(&self, id: i64) -> Result<Project, DatabaseError> {
        let conn = self.conn.lock().unwrap();

        let project = conn.query_row(
            "SELECT id, name, path, icon, icon_color, active_environment, created_at, updated_at
             FROM projects WHERE id = ?1",
            params![id],
            |row| {
                Ok(Project {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    path: row.get(2)?,
                    icon: row.get(3)?,
                    icon_color: row.get(4)?,
                    active_environment: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => DatabaseError::NotFound,
            _ => DatabaseError::Sqlite(e),
        })?;

        Ok(project)
    }

    pub fn delete_project(&self, id: i64) -> Result<(), DatabaseError> {
        let conn = self.conn.lock().unwrap();

        let affected = conn.execute("DELETE FROM projects WHERE id = ?1", params![id])?;

        if affected == 0 {
            return Err(DatabaseError::NotFound);
        }

        Ok(())
    }

    pub fn update_project(
        &self,
        id: i64,
        name: Option<String>,
        icon: Option<String>,
        icon_color: Option<String>,
    ) -> Result<Project, DatabaseError> {
        let conn = self.conn.lock().unwrap();

        conn.execute(
            "UPDATE projects SET
                name = COALESCE(?1, name),
                icon = COALESCE(?2, icon),
                icon_color = COALESCE(?3, icon_color),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?4",
            params![name, icon, icon_color, id],
        )?;

        drop(conn);
        self.get_project(id)
    }

    // Environment methods
    pub fn set_active_environment(&self, project_id: i64, env_name: &str) -> Result<(), DatabaseError> {
        let conn = self.conn.lock().unwrap();

        let affected = conn.execute(
            "UPDATE projects SET active_environment = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
            params![env_name, project_id],
        )?;

        if affected == 0 {
            return Err(DatabaseError::NotFound);
        }

        Ok(())
    }

    pub fn get_active_environment(&self, project_id: i64) -> Result<Option<String>, DatabaseError> {
        let conn = self.conn.lock().unwrap();

        let result = conn.query_row(
            "SELECT active_environment FROM projects WHERE id = ?1",
            params![project_id],
            |row| row.get::<_, Option<String>>(0),
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => DatabaseError::NotFound,
            _ => DatabaseError::Sqlite(e),
        })?;

        Ok(result)
    }

    pub fn add_env_history(&self, project_id: i64, env_name: &str) -> Result<(), DatabaseError> {
        let conn = self.conn.lock().unwrap();

        conn.execute(
            "INSERT INTO env_history (project_id, env_name) VALUES (?1, ?2)",
            params![project_id, env_name],
        )?;

        Ok(())
    }
}
