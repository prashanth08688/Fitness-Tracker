pipeline {
    agent any

    tools {
        nodejs "node18"   // use the NodeJS version you configured in Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'dev',
                    url: 'https://github.com/prashanth08688/Fitness-Tracker.git',
                    credentialsId: 'Fitness-TrackerCred'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Check') {
            steps {
                // Check that app.js is valid JavaScript (no syntax errors)
                sh 'node -c app.js'
            }
        }
    }

    post {
        success {
            echo '✅ Build successful. Notify Tester.'
        }
        failure {
            echo '❌ Build failed. Developers must fix.'
        }
    }
}
