pipeline {
    agent any

    tools {
        nodejs "node18"   // must match Jenkins -> Global Tool Config
    }

    environment {
        GIT_CRED = 'Fitness-TrackerCred'   // GitHub PAT (username + token)
    }

    stages {
        stage('Checkout dev') {
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
                withCredentials([
                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'firebase-project-id', variable: 'FIREBASE_PROJECT_ID'),
                    string(credentialsId: 'firebase-private-key-id', variable: 'FIREBASE_PRIVATE_KEY_ID'),
                    string(credentialsId: 'firebase-private-key', variable: 'FIREBASE_PRIVATE_KEY'),
                    string(credentialsId: 'firebase-client-email', variable: 'FIREBASE_CLIENT_EMAIL'),
                    string(credentialsId: 'firebase-client-id', variable: 'FIREBASE_CLIENT_ID'),
                    string(credentialsId: 'firebase-client-cert-url', variable: 'FIREBASE_CLIENT_X509_CERT_URL')
                ]) {
                    bat '''
                    powershell -Command "$p = Start-Process -FilePath node -ArgumentList 'app.js' -PassThru; $p.Id | Out-File -FilePath server.pid -Encoding ascii"
                    powershell -Command "Write-Output 'Waiting for server...'; while(-not (Test-NetConnection -ComputerName 'localhost' -Port 3000).TcpTestSucceeded){Start-Sleep -Seconds 1}; Write-Output 'Server ready.'"
                    '''
                }
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

        stage('Sync dev -> main') {
            when {
                expression { currentBuild.currentResult == "SUCCESS" }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: "${GIT_CRED}", usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    bat """
                    git config user.email "ci-bot@example.com"
                    git config user.name "Jenkins CI Bot"
                    git fetch origin
                    git checkout dev
                    git pull origin dev
                    git push https://%GIT_USER%:%GIT_TOKEN%@github.com/prashanth08688/Fitness-Tracker.git dev:main --force
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build, tests passed — dev synced to main'
        }
        failure {
            echo '❌ Build/tests failed — main not updated'
        }
    }
}
