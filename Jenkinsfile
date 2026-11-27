pipeline {
    agent any

    tools {
        nodejs 'NodeJS-24'
        'hudson.plugins.sonar.SonarRunnerInstallation' 'SonarScanner'
    }

    environment {
        SONAR_PROJECT_KEY  = 'expense-tracker'
        SONAR_PROJECT_NAME = 'Expense Tracker'
        ARCHIVE_NAME       = "expense-tracker-${env.BUILD_NUMBER}.tar.gz"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install and Test') {
            steps {
                sh 'npm ci && npm test -- --run'
            }
        }

        stage('Generate coverage') {
            steps {
                sh 'npm run test:coverage'
                archiveArtifacts artifacts: 'coverage/lcov.info', fingerprint: true, allowEmptyArchive: true
            }
        }

        stage('SonarQube analysis') {
            when {
                branch 'main'
            }
            steps {
                withSonarQubeEnv('SonarQube-Lab') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        sh """
                            "${scannerHome}/bin/sonar-scanner" \\
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \\
                              -Dsonar.projectName="${SONAR_PROJECT_NAME}" \\
                              -Dsonar.sources=src \\
                              -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }

        stage('Quality gate') {
            when {
                branch 'main'
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'main'
                }
            }
            steps {
                sh 'npm run build'
            }
        }

        stage('Archive artifact') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    rm -rf artifact-staging
                    mkdir -p artifact-staging
                    cp -r dist artifact-staging/dist
                    cp Dockerfile artifact-staging/Dockerfile
                    tar --exclude='node_modules' -czf ${ARCHIVE_NAME} -C artifact-staging dist Dockerfile
                """
                archiveArtifacts artifacts: "${ARCHIVE_NAME}", fingerprint: true
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}