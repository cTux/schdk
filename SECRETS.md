# Release secrets

The `Release` GitHub Actions workflow needs the repository secrets below.
Never commit their values or paste them into issues, pull requests, or logs.

| Secret                            | Value to store                                                                                                      | Where to get it                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GOOGLE_DESKTOP_CREDENTIALS_JSON` | Complete downloaded JSON for an OAuth 2.0 **Desktop app** client                                                    | Create the client in [Google Auth Platform](https://console.cloud.google.com/auth/clients); follow Google's [desktop client instructions](https://developers.google.com/workspace/guides/create-credentials#desktop-app).                                                                                                                                                                                      |
| `WINDOWS_CERTIFICATE_BASE64`      | Base64-encoded bytes of a password-protected, exportable `.pfx` code-signing certificate containing its private key | Buy a publicly trusted code-signing certificate from a certificate authority; Microsoft documents the [CA requirement](https://learn.microsoft.com/windows/win32/dxtecharts/authenticode-signing-for-game-developers) and [PFX signing format](https://learn.microsoft.com/windows/win32/seccrypto/using-signtool-to-sign-a-file). Confirm before purchase that the certificate can be exported as PFX for CI. |
| `WINDOWS_CERTIFICATE_PASSWORD`    | Password used when exporting the Windows `.pfx`                                                                     | Set during PFX export.                                                                                                                                                                                                                                                                                                                                                                                         |

## Encode certificate files

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("certificate.pfx"))
```

Store the resulting single-line text in the matching `*_BASE64` secret.

## Set the secrets

Open [repository Actions secrets](https://github.com/cTux/schdk/settings/secrets/actions),
select **New repository secret**, and add each name exactly as written above.
The existing names can be checked without exposing values:

```powershell
gh secret list --app actions
```

Cloud/HSM-only Windows certificates cannot be used by the current PFX-based
workflow; supporting one requires a separate signing-provider integration.
