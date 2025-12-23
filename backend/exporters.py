import csv
import io
import zipfile
from typing import List, Dict, Any

class DataExporter:
    @staticmethod
    def to_csv_zip(tables_data: Dict[str, List[Dict[str, Any]]]) -> bytes:
        """
        Creates a ZIP file containing a CSV file for each table.
        """
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for table_name, rows in tables_data.items():
                if not rows:
                    continue
                
                csv_buffer = io.StringIO()
                headers = rows[0].keys()
                writer = csv.DictWriter(csv_buffer, fieldnames=headers)
                writer.writeheader()
                writer.writerows(rows)
                
                zip_file.writestr(f"{table_name}.csv", csv_buffer.getvalue())
        
        return zip_buffer.getvalue()

    @staticmethod
    def to_sql(tables_data: Dict[str, List[Dict[str, Any]]]) -> str:
        """
        Converts multiple tables to a single SQL script string.
        """
        all_sql_statements = []

        for table_name, rows in tables_data.items():
            if not rows:
                continue

            all_sql_statements.append(f"-- Table: {table_name}")
            headers = list(rows[0].keys())
            columns = ", ".join(headers)
            
            for row in rows:
                values = []
                for header in headers:
                    val = row.get(header)
                    if val is None:
                        values.append("NULL")
                    elif isinstance(val, (int, float)):
                        values.append(str(val))
                    else:
                        clean_val = str(val).replace("'", "''")
                        values.append(f"'{clean_val}'")
                
                value_str = ", ".join(values)
                statement = f"INSERT INTO {table_name} ({columns}) VALUES ({value_str});"
                all_sql_statements.append(statement)
            
            all_sql_statements.append("")

        return "\n".join(all_sql_statements)