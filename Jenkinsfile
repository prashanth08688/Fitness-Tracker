pipeline {
    agent any

    tools {
        nodejs "node18"
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
                bat 'npm install'
            }
        }

        stage('Build Check') {
            steps {
                bat 'node -c app.js'
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
