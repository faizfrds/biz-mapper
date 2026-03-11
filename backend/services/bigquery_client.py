import os
from google.cloud import bigquery
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")

# Initialize client with default credentials (requires `gcloud auth application-default login` or GOOGLE_APPLICATION_CREDENTIALS)
# Or if running locally, the project parameter points to the billing project
client = bigquery.Client(project=PROJECT_ID)

def get_table_schema(dataset_id: str, table_id: str, project_id: str = "bigquery-public-data") -> list[dict]:
    """
    Retrieves the schema for a specific BigQuery table.
    
    Args:
        dataset_id: The ID of the dataset.
        table_id: The ID of the table.
        project_id: The project ID (defaults to bigquery-public-data).
        
    Returns:
        A list of dictionaries containing 'name' and 'type' for each field.
    """
    table_ref = f"{project_id}.{dataset_id}.{table_id}"
    try:
        table = client.get_table(table_ref)
        schema = [{"name": field.name, "type": field.field_type} for field in table.schema]
        return schema
    except Exception as e:
        print(f"Error fetching schema for {table_ref}: {e}")
        return []

def execute_query(sql: str, dry_run: bool = False) -> list[dict]:
    """
    Executes a SQL query in BigQuery.
    
    Args:
        sql: The SQL string to execute.
        dry_run: If True, only estimates bytes processed without running the query.
        
    Returns:
        A list of dictionaries representing the rows returned.
    """
    try:
        if dry_run:
            job_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
            query_job = client.query(sql, job_config=job_config)
            bytes_processed = query_job.total_bytes_processed
            return [{"dry_run": True, "estimated_bytes_processed": bytes_processed}]
            
        query_job = client.query(sql)
        results = query_job.result()
        return [dict(row) for row in results]
    except Exception as e:
        print(f"Error executing query: {e}")
        return [{"error": str(e)}]
