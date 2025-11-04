# Security Policy

## Test Data Notice

**IMPORTANT**: This repository contains **test data** and **example code** for security testing purposes.

### Test API Keys

All API keys, secrets, and credentials found in the following files are **FAKE** and used only for testing:

- `test-website/` - Test website with simulated vulnerabilities
- `API_VALIDATION_REPORT.md` - Test results containing example findings
- `TEST_REPORT.md` - Test scenarios with mock data
- `api_test_results.json` - Test output with example secrets

**These are NOT real credentials and pose no security risk.**

### Purpose

JS Hunter is a security analysis tool designed to find vulnerabilities in JavaScript code. The test files demonstrate:
- How the tool detects API key leaks
- Example security vulnerabilities
- Test scenarios for penetration testing

### Real Security

For production use:
- Never hardcode real API keys in code
- Use environment variables for secrets
- Follow the security guidelines in `DEPLOYMENT_GUIDE.md`

## Reporting Real Security Issues

If you discover a real security vulnerability in JS Hunter itself (not the test data), please report it via:
- GitHub Security Advisories
- Email: (to be added)

Thank you for helping keep JS Hunter secure!
