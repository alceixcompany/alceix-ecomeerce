# Dropshipping & supplier network

Route: `/dropshipping-tedarik`; sample catalog anchor: `#katalog`.
Uses the shared marketing header, footer, theme and partner logos. Images are local assets under `public/dropshipping`.

Category filters operate on four sample products. Add buttons require the current account and import the chosen sample into its store through the API as a draft with zero stock. This is an explicit sample template, without a real supplier connection. The pricing simulator calculates sale price minus wholesale cost, labelled gross profit because shipping, tax and other fees are excluded.

Program statistics, logistics commitments and commercial claims originate from the supplied reference and need business confirmation before publication. Store creation links lead to the existing home-page registration section. Real supplier synchronization remains pending provider and business contracts.

Keep development previews and production verification in separate build directories to avoid overwriting an active Next.js dev server's manifests.
