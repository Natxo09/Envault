use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: i64,
    pub name: String,
    pub path: String,
    pub icon: String,
    pub icon_color: String,
    pub active_environment: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EnvFile {
    pub name: String,
    pub path: String,
    pub is_active: bool,
    pub modified_at: Option<String>,
}
