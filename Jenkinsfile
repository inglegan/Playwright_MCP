pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.63.0-noble'
      args '--ipc=host'
    }
  }

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 60, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
  }

  environment {
    CI = 'true'
    PLAYWRIGHT_JUNIT_OUTPUT_FILE = 'results.xml'
  }

  stages {
    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Run Playwright tests') {
      steps {
        sh 'npm run test:allure'
      }
    }
  }

  post {
    always {
      junit testResults: 'results.xml', allowEmptyResults: true
      archiveArtifacts artifacts: 'playwright-report/**,test-results/**,allure-results/**,allure-report/**,results.xml', allowEmptyArchive: true
    }
  }
}