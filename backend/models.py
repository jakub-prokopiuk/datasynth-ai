from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

FieldType = Literal["faker", "llm", "distribution", "foreign_key", "integer", "boolean", "regex", "timestamp"]

class FieldSchema(BaseModel):
    name: str = Field(..., description="Name of field in the resulting dataset")
    type: FieldType = Field(..., description="Type of generator")
    params: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[str] = Field(default_factory=list)
    is_unique: bool = Field(False, description="Ensure values are unique within the column")

class TableSchema(BaseModel):
    id: str = Field(..., description="Unique internal ID of the table")
    name: str = Field(..., description="Name of the table")
    rows_count: int = Field(10, ge=1, le=1000)
    fields: List[FieldSchema]

class GeneratorConfig(BaseModel):
    job_name: str = "My Database"
    global_context: Optional[str] = None
    output_format: Literal["json", "csv", "sql"] = "json"

class GeneratorRequest(BaseModel):
    config: GeneratorConfig
    tables: List[TableSchema]