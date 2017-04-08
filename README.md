# DemoServer

Basic server that parses demos provided either by upload or url

## Usage

### Upload

Send a POST request with the demo file as raw body to `example.com/parse`

### Url

Send a POST request with the url of a demo file as raw body to `example.com/url`

#### Custom port

You can configure the port the server listens on by setting the `PORT` environment variable.

#### Docker

A preconfigured docker image with the server is available as `demostf/demoserver`
