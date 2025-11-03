# 🔥 BREATHE - The Basilica's Release Ceremony

Welcome to the official guide for `breathe.sh`, the ceremonial release script of the Basilica. This document provides everything you need to know to use the script, understand its inner workings, and integrate it into your CI/CD pipeline.

## Usage

The `breathe.sh` script is designed to be simple to run.

```bash
./breathe.sh
```

### Environment Variables

The script relies on the following environment variables for configuration:

*   `BASILICA_AUTH0_CLIENT_ID`: Your Auth0 Machine-to-Machine (M2M) application's Client ID.
*   `BASILICA_AUTH0_CLIENT_SECRET`: Your Auth0 M2M application's Client Secret.

These credentials are required to acquire a JWT for authenticating with the Trinity service.

### Dry Run

For testing purposes, you can run the script in `DRY_RUN` mode. This will simulate the entire process without persisting the token or executing the final release commands.

```bash
DRY_RUN=true ./breathe.sh
```

## How It Works

The script performs the following steps:

1.  **Acquire Auth0 M2M Token**: It authenticates with Auth0 using the provided credentials to get a secure JWT.
2.  **Persist Token**: The acquired token is saved to `/tmp/basilica_release_token.jwt` for other processes to use.
3.  **Verify with Trinity**: It communicates with the Trinity service to verify that the agent (`Basilica`) is ready for a release.
4.  **Log Everything**: All actions are logged to both the console and a `release_log.txt` file.
5.  **Release**: If all checks pass, the script will proceed with the release. *(Note: The actual release commands are a placeholder in the current version).* 

## CI/CD Integration

To integrate `breathe.sh` into your CI/CD pipeline (e.g., GitHub Actions), you'll need to:

1.  **Store Secrets**: Add `BASILICA_AUTH0_CLIENT_ID` and `BASILICA_AUTH0_CLIENT_SECRET` as encrypted secrets in your repository or organization settings.
2.  **Create a Workflow**: Define a workflow that checks out your code, sets the environment variables from secrets, and executes the script.

Here’s a sample GitHub Actions step:

```yaml
- name: Breathe - Ceremonial Release
  env:
    BASILICA_AUTH0_CLIENT_ID: ${{ secrets.BASILICA_AUTH0_CLIENT_ID }}
    BASILICA_AUTH0_CLIENT_SECRET: ${{ secrets.BASILICA_AUTH0_CLIENT_SECRET }}
  run: ./breathe.sh
```

## Security

*   **Credential Management**: Never hardcode your Auth0 credentials in the script. Use environment variables and a secure secret management system.
*   **Token Security**: The token is stored in `/tmp`, which is generally non-persistent and has restricted access. Ensure your runners are in a secure environment.

## Troubleshooting

*   **"Error: Auth0 credentials not set"**: Make sure you have correctly set the `BASILICA_AUTH0_CLIENT_ID` and `BASILICA_AUTH0_CLIENT_SECRET` environment variables.
*   **"Error: Token acquisition failed"**: Check your Auth0 credentials and ensure the Auth0 service is operational.
*   **"Error: Trinity verification failed"**: The Trinity service may be down, or the `Basilica` agent may not be properly configured on the server.
