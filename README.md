# Auto Sync Forked Repos
[![Build Status](https://travis-ci.org/NoahDragon/update-forked-repo.svg?branch=master)](https://travis-ci.org/NoahDragon/update-forked-repo)

## How to Run

On local or server:

```bash
git clone https://github.com/NoahDragon/update-forked-repo.git
cd update-forked-repo
npm install
npm start
```

On travis-ci:

Fork this repo, and add it to travis-ci. Set cron task or trigger it manually to run.

The `.travis.yml` file already includes in the repo.

## Configuration

The app could be configurable in `.config.yml`.

```yaml
org: ForkedReposBak # Repos under an organization
user: NoahDragon    # Repos under a user
auth:
  token:            # Personalized token from Github 
```

The configuration could also set into environment variables:

`GITHUB_REPO_FROM_ORG` for the org.
`GITHUB_REPO_FROM_USER` for the user.
`GITHUB_TOKEN` for the token.

## Caveats

* The forked repos should never been edited or contained any conflict commit with the source repos.
* Only support forked repos within Github.
* Need personal Github token to push repos.
* Should not contains private repos.

## TODO

* Filter out private repos as personal access token cannot use on them.