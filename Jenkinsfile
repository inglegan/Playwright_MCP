pipeline {
    agent any

    stages {
        stage('Instalar Dependencias') {
            steps {
                // En Windows se usa bat en lugar de sh
                bat 'npm install'
            }
        }
        stage('Ejecutar Pruebas Playwright') {
            steps {
                // Ejecuta las pruebas con el reporte en línea en entorno Windows
                bat 'npx playwright test --reporter=line'
            }
        }
    }
}
