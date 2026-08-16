# MyCloud Web — Stage 1

This is the first frontend for a personal cloud project.

## Important

This frontend does NOT yet work directly with Shttps.

Shttps currently provides a directory/file server, while this frontend expects a small API that we will build on your Android phone.

Expected API:

- `GET /api/health`
- `GET /api/files`
- `POST /api/upload`

Example `/api/files` response:

```json
[
  {
    "name": "photo.jpg",
    "size": 1234567,
    "type": "image/jpeg",
    "url": "/files/photo.jpg"
  }
]
```

## GitHub Pages

Upload `index.html`, `style.css`, and `app.js` to a GitHub repository and enable GitHub Pages.

Do not put passwords, API keys, private tokens, or your personal files in the GitHub repository.

## Next stage

Build the Android API/server and connect it to this frontend.

Remote access should use HTTPS and a secure network path. Do not expose an unfinished HTTP file server directly to the public internet.
