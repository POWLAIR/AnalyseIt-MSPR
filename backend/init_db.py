import os
from sqlalchemy import text
from core.db import engine

def init_db():
    """
    Initialise la base de données en exécutant le script SQL de création des tables
    """
    try:
        with engine.begin() as conn:
            # Construire le chemin absolu vers le fichier SQL
            current_dir = os.path.dirname(os.path.abspath(__file__))
            sql_file_path = os.path.join(current_dir, "sql", "create_tables.sql")
            
            with open(sql_file_path, "r") as file:
                sql_script = file.read()
                conn.execute(text(sql_script))
                print("✅ Base de données initialisée avec succès.")
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation de la base de données : {str(e)}")
        raise

if __name__ == "__main__":
    init_db() 