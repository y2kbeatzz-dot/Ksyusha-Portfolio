# Portfolio enhancements
Original React Bits components are included under LICENSE-react-bits.md. Site-specific React integration is in src/site.jsx.
GitHub Pages builds the bundle in Actions. Existing static files are retained.
## Review moderation
Visitors draft a public GitHub issue and sign in to submit. Never request confidential information. Only approved reviews from assets/approved-reviews.json are rendered. To approve, edit that file with objects {"name":"Display name","rating":5,"text":"Approved comment"} and commit. Close or report spam issues using GitHub's native controls. No visitor tokens or administrator secrets are embedded. This is manual moderation, not a private submission backend or automated spam filter.
