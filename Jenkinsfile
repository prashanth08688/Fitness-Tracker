pipeline {
    agent any

    tools {
        nodejs "node18"   // Must match your NodeJS name in Jenkins -> Global Tool Config
    }

    environment {
        GIT_CRED = 'Fitness-TrackerCred'   // Jenkins credential ID for GitHub PAT

        // Inject environment variables from Jenkins Credentials
        PORT                       = '3000'
        JWT_SECRET                 = credentials('jwt-secret')
        FIREBASE_TYPE              = 'service_account'
        FIREBASE_PROJECT_ID        = credentials('firebase-project-id')
        FIREBASE_PRIVATE_KEY_ID    = credentials('firebase-private-key-id')
        FIREBASE_PRIVATE_KEY       = credentials('firebase-private-key')
        FIREBASE_CLIENT_EMAIL      = credentials('firebase-client-email')
        FIREBASE_CLIENT_ID         = credentials('firebase-client-id')
        FIREBASE_AUTH_URI          = 'https://accounts.google.com/o/oauth2/auth'
        FIREBASE_TOKEN_URI         = 'https://oauth2.googleapis.com/token'
        FIREBASE_AUTH_PROVIDER_X509_CERT_URL = 'https://www.googleapis.com/oauth2/v1/certs'
        FIREBASE_CLIENT_X509_CERT_URL       = credentials('firebase-client-cert-url')
        FIREBASE_UNIVERSE_DOMAIN   = 'googleapis.com'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'dev',
                    url: 'https://github.com/prashanth08688/Fitness-Tracker.git',
                    credentialsId: "${GIT_CRED}"
            }
        }

        stage('Install Node dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build Check') {
            steps {
                bat 'node -c app.js'
            }
        }

        stage('Start server (background)') {
            steps {
                bat '''
                powershell -Command "$p = Start-Process -FilePath node -ArgumentList 'app.js' -PassThru; $p.Id | Out-File -FilePath server.pid -Encoding ascii"
                powershell -Command "Write-Output 'Waiting for server...'; while(-not (Test-NetConnection -ComputerName 'localhost' -Port 3000).TcpTestSucceeded){Start-Sleep -Seconds 1}; Write-Output 'Server ready.'"
                '''
            }
        }

        stage('Run Selenium tests') {
            steps {
                bat '''
                python -m venv venv
                call venv\\Scripts\\activate
                pip install -r tests/requirements.txt
                pytest tests/ -q --maxfail=1 --disable-warnings --junitxml=report.xml
                '''
            }
            post {
                always {
                    junit 'report.xml'
                }
            }
        }

        stage('Stop server') {
            steps {
                bat '''
                if exist server.pid (
                  for /f "usebackq delims=" %%i in (server.pid) do powershell -Command "Stop-Process -Id %%i -Force"
                  del server.pid
                )
                '''
            }
        }

        stage('Merge dev -> main (auto)') {
            when {
                expression { currentBuild.currentResult == "SUCCESS" }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: "${GIT_CRED}", usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    bat """
                    git config user.email "ci-bot@example.com"
                    git config user.name "Jenkins CI Bot"
                    git fetch origin
                    git checkout main
                    git pull origin main
                    git merge origin/dev --no-edit
                    git push https://%GIT_USER%:%GIT_TOKEN%@github.com/prashanth08688/Fitness-Tracker.git main
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build, tests, and merge completed successfully.'
        }
        failure {
            echo '❌ Pipeline failed — check console + test reports.'
        }
    }
}
