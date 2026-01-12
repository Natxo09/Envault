use crate::database::Database;
use crate::types::Project;
use serde::Deserialize;
use std::path::Path;
use tauri::State;

#[tauri::command]
pub fn add_project(path: String, db: State<Database>) -> Result<Project, String> {
    let path_obj = Path::new(&path);

    // Verify path exists and is a directory
    if !path_obj.exists() {
        return Err("Path does not exist".to_string());
    }
    if !path_obj.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    // Extract directory name as default project name
    let name = path_obj
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Unnamed Project")
        .to_string();

    db.insert_project(&name, &path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_projects(db: State<Database>) -> Result<Vec<Project>, String> {
    db.get_all_projects().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_project(id: i64, db: State<Database>) -> Result<(), String> {
    db.delete_project(id).map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectParams {
    pub id: i64,
    pub name: Option<String>,
    pub icon: Option<String>,
    pub icon_color: Option<String>,
}

#[tauri::command]
pub fn update_project(params: UpdateProjectParams, db: State<Database>) -> Result<Project, String> {
    db.update_project(params.id, params.name, params.icon, params.icon_color)
        .map_err(|e| e.to_string())
}
