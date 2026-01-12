use rusqlite::{Connection, Result as SqliteResult};
use std::sync::Mutex;

pub struct Database {
    conn: Mutex<Connection>,
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

        Ok(())
    }
}
