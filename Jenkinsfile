pipeline {
    agent any

    tools {
jenkins-ci
        nodejs "node18"   // must match the Tools->NodeJS name you configured
    }

    environment {
        GIT_CRED = 'github-token'   // Jenkins credential ID for your PAT

        nodejs "node18"
 dev
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'dev',
                    url: 'https://github.com/prashanth08688/Fitness-Tracker.git',
 jenkins-ci
                    credentialsId: "${GIT_CRED}"
            }
        }

        stage('Install Node deps') {
                    credentialsId: 'Fitness-TrackerCred'
            }
        }

        stage('Install Dependencies') {
          dev
            steps {
                bat 'npm install'
            }
        }

        jenkins-ci
        stage('Build check') {

        stage('Build Check') {
            dev
            steps {
                bat 'node -c app.js'
            }
        }
        jenkins-ci

        stage('Start server (background)') {
            steps {
                // Start node app in background and write PID to server.pid
                bat '''
                powershell -Command "$p = Start-Process -FilePath node -ArgumentList 'app.js' -PassThru; $p.Id | Out-File -FilePath server.pid -Encoding ascii"
                powershell -Command "Write-Output 'Waiting for server to be ready...'; while(-not (Test-NetConnection -ComputerName 'localhost' -Port 3000).TcpTestSucceeded){Start-Sleep -Seconds 1}; Write-Output 'Server is up'"
                '''
            }
        }

        stage('Run Selenium tests') {
            steps {
                bat '''
                python -m venv venv
                call venv\\Scripts\\activate
                pip install -r tests/requirements.txt
                pytest tests/ -q --maxfail=1 --disable-warnings
                '''
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
        success { echo '✅ Build, tests and merge completed successfully.' }
        failure { echo '❌ Pipeline failed — check console output.' }

    }

    post {
        success {
            echo '✅ Build successful. Notify Tester.'
        }
        failure {
            echo '❌ Build failed. Developers must fix.'
        }
 dev
    }
}
