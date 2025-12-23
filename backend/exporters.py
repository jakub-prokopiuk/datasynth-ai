import csv
import io
from typing import List, Dict, Any

class DataExporter:
    @staticmethod
    def to_csv(data: List[Dict[str, Any]]) -> str:
        """
        Converts list of dicts to CSV string.
        """
        if not data:
            return ""
        
        output = io.StringIO()
        
        headers = data[0].keys()
        
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)
        
        return output.getvalue()

    @staticmethod
    def to_sql(data: List[Dict[str, Any]], table_name: str = "generated_data") -> str:
        """
        Converts list of dicts to SQL INSERT statements.
        Example: INSERT INTO table (col1, col2) VALUES ('val1', 'val2');
        """
        if not data:
            return ""

        headers = list(data[0].keys())
        columns = ", ".join(headers)
        
        sql_statements = []

        for row in data:
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
            sql_statements.append(statement)

        return "\n".join(sql_statements)