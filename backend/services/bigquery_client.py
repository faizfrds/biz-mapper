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
        dataset_id: The ID of the dataset, or a fully-qualified table ID (e.g., 'project.dataset.table').
        table_id: The ID of the table. Ignored if dataset_id is a fully-qualified ID.
        project_id: The project ID (defaults to bigquery-public-data). Ignored if dataset_id is fully-qualified.

    Returns:
        A list of dictionaries containing 'name' and 'type' for each field.
    """
    # Handle fully-qualified table IDs and edge cases
    if '.' in dataset_id:
        parts = dataset_id.split('.')
        if len(parts) == 3:
            # Already fully qualified: project.dataset.table
            table_ref = dataset_id
        elif len(parts) == 4:
            # Handle redundant prefix like "bigquery-public-data.bigquery_public_data.dataset.table"
            # Use the first part as project, last two as dataset.table
            table_ref = f"{parts[0]}.{parts[2]}.{parts[3]}"
        elif len(parts) == 2:
            # Could be "dataset.table" or "prefix.dataset"
            # Check if first part looks like a project/dataset prefix (contains underscore or "public")
            if 'public' in parts[0] or '_' in parts[0]:
                # Likely "bigquery_public_data.dataset" - use just the second part as dataset
                table_ref = f"{project_id}.{parts[1]}.{table_id}"
            else:
                # Standard "dataset.table" format
                table_ref = f"{project_id}.{dataset_id}.{table_id}"
        else:
            table_ref = f"{project_id}.{dataset_id}.{table_id}"
    else:
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
