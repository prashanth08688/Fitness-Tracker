pipeline {
    agent any

    tools {
    jenkins-ci
        nodejs "node18"   // must match the NodeJS tool name in Jenkins -> Global Tool Config
    }

    environment {
        GIT_CRED = 'Fitness-TrackerCred'   // Jenkins credential ID (your GitHub PAT)

        nodejs "node18"   // must match the Tools->NodeJS name you configured
    }

    environment {
        GIT_CRED = 'Fitness-TrackerCred'   // Jenkins credential ID for your PAT
        dev
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'dev',
        jenkins-ci
                    credentialsId: "${GIT_CRED}",
                    url: 'https://github.com/prashanth08688/Fitness-Tracker.git'

                    url: 'https://github.com/prashanth08688/Fitness-Tracker.git',
                    credentialsId: "${GIT_CRED}"
       dev
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
        jenkins-ci
                // start Node.js server in background

        dev
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
                    // publish JUnit report in Jenkins UI
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
        jenkins-ci
        success { echo '✅ Build, tests, and merge completed successfully.' }
        failure { echo '❌ Pipeline failed — check console + test reports.' }

        success {
            echo '✅ Build, tests and merge completed successfully.'
        }
        failure {
            echo '❌ Pipeline failed — check console output.'
        }
        dev
    }
}
