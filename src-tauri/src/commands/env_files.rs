use crate::database::Database;
use crate::types::EnvFile;
use std::fs;
use std::path::Path;
use tauri::State;

#[tauri::command]
pub fn scan_env_files(project_path: String, active_env: Option<String>) -> Result<Vec<EnvFile>, String> {
    let path = Path::new(&project_path);

    if !path.exists() || !path.is_dir() {
        return Err("Invalid project path".to_string());
    }

    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;

    let mut env_files: Vec<EnvFile> = Vec::new();

    for entry in entries.flatten() {
        let file_name = entry.file_name();
        let file_name_str = file_name.to_string_lossy();

        // Match .env files: .env, .env.local, .env.development, etc.
        if file_name_str.starts_with(".env") {
            let metadata = entry.metadata().ok();
            let modified_at = metadata
                .and_then(|m| m.modified().ok())
                .map(|t| {
                    let datetime: chrono::DateTime<chrono::Utc> = t.into();
                    datetime.format("%Y-%m-%d %H:%M:%S").to_string()
                });

            let is_active = active_env
                .as_ref()
                .map(|active| active == &file_name_str.to_string())
                .unwrap_or(false);

            env_files.push(EnvFile {
                name: file_name_str.to_string(),
                path: entry.path().to_string_lossy().to_string(),
                is_active,
                modified_at,
            });
        }
    }

    // Sort: .env first, then alphabetically
    env_files.sort_by(|a, b| {
        if a.name == ".env" {
            std::cmp::Ordering::Less
        } else if b.name == ".env" {
            std::cmp::Ordering::Greater
        } else {
            a.name.cmp(&b.name)
        }
    });

    Ok(env_files)
}

#[tauri::command]
pub fn activate_env(
    project_id: i64,
    env_name: String,
    db: State<Database>,
) -> Result<(), String> {
    // Get project path from database
    let project = db.get_project(project_id).map_err(|e| e.to_string())?;

    let project_path = Path::new(&project.path);
    let env_source = project_path.join(&env_name);
    let env_target = project_path.join(".env");

    // Verify source file exists
    if !env_source.exists() {
        return Err(format!("Environment file {} does not exist", env_name));
    }

    // If activating .env itself, just update the database
    if env_name == ".env" {
        db.set_active_environment(project_id, &env_name)
            .map_err(|e| e.to_string())?;
        db.add_env_history(project_id, &env_name)
            .map_err(|e| e.to_string())?;
        return Ok(());
    }

    // Create backup of current .env if it exists
    if env_target.exists() {
        let backup_path = project_path.join(".env.backup");
        fs::copy(&env_target, &backup_path).map_err(|e| e.to_string())?;
    }

    // Copy content from source to .env
    fs::copy(&env_source, &env_target).map_err(|e| e.to_string())?;

    // Update database
    db.set_active_environment(project_id, &env_name)
        .map_err(|e| e.to_string())?;
    db.add_env_history(project_id, &env_name)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_active_env(project_id: i64, db: State<Database>) -> Result<Option<String>, String> {
    db.get_active_environment(project_id)
        .map_err(|e| e.to_string())
}
