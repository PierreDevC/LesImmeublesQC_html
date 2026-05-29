# 🏢 Code Audit — `les-immeubles-qc` Custom Theme

**Project:** Les Immeubles QC (student & residential apartment rentals, Montréal)
**Theme path:** `/Applications/MAMP/htdocs/LesImmeublesQC/wp-content/themes/les-immeubles-qc/`
**Stack:** WordPress, PHP 8.3, MAMP · ACF 6.8.x · Rank Math SEO · Contact Form 7 · WP Mail SMTP · Novamira
**Files reviewed:** `functions.php`, `header.php`, `footer.php`, `index.php`, `front-page.php`, `single-appartement.php`, `page-location-appartements-etudiants-montreal.php`, `page-projets-location.php`, `page-a-propos.php`, `main.js`
**Date:** 2026-05-29

---

## 1. Executive Summary

The theme is **functional, visually polished, and shows real WordPress competence** — native template hierarchy is respected (`front-page.php`, `single-{cpt}.php`, slug-matched page templates), CPT/taxonomy registration is clean, output escaping is *mostly* present (`esc_url`, `esc_html`, `esc_attr`), `filemtime()` cache-busting is used on assets, and there is a thoughtful dual-mode JS layer that lets the same `main.js`/`style.css` serve both the static prototype and the live theme.

However, the codebase is at a **"talented solo-dev prototype" maturity level**, not yet production-hardened. The dominant problems are **performance** (an unbounded apartment query + ACF meta reads execute on *every* page request; the projets page fires **eight** unbounded queries just to print counts) and **architecture/maintainability** (the primary navigation is hardcoded in JavaScript rather than a WP menu; "active" listings are selected by exact-title string matching; large inline `<style>`/`<script>` blocks; a monolithic `functions.php`; zero i18n). There is also one **functional regression**: a corrupted/unclosed HTML comment in `page-projets-location.php` that hides the entire projects grid (and everything below it) in the browser.

Security posture is **acceptable but not airtight** — no raw SQL, escaping is generally good, but `wp_body_open()` is missing and a term-meta save handler lacks an explicit nonce check. On SEO, the FAQ schema is hardcoded and its text **no longer matches the visible questions** (a rich-result disqualifier), and the apartment detail pages — the commercial core of the site — carry **no real-estate structured data at all**.

| | |
|---|---|
| **Overall Grade** | **C+ / B-** — solid foundations, ships and works, but carries one rendering bug, significant per-request query waste, and several maintainability debts that will hurt as the catalogue grows. |
| **Biggest win available** | Conditionally enqueue + transient-cache the apartment data (AUD-02) and collapse the 8 projets queries (AUD-03). |
| **Most urgent** | AUD-01 (projects section currently hidden in-browser). |

---

## 2. Summary Table of Findings

| ID | Severity | Pillar | Location / File | Brief Description |
|----|----------|--------|-----------------|-------------------|
| **AUD-01** | 🔴 CRITICAL | Architecture | `page-projets-location.php:116` | Corrupted, unclosed HTML comment (`<!-- �`) swallows the entire projects grid + footer in the browser. |
| **AUD-02** | 🟠 HIGH | Performance | `functions.php:8-121` | Unbounded `WP_Query` + 7× `get_field()` per post run on **every** front-end request, even pages that never use the data. No caching. |
| **AUD-03** | 🟠 HIGH | Performance | `page-projets-location.php:5-83` | **8** separate `WP_Query` calls with `posts_per_page => -1` just to read `found_posts` counts, over unindexed text meta. |
| **AUD-04** | 🟠 HIGH | Architecture / Plugin | `main.js:15-24`, `header.php:25` | Primary navigation is a hardcoded JS array — not a WP menu. Not editable in admin, not i18n-able, invisible to crawlers without JS. |
| **AUD-05** | 🟠 HIGH | SEO / Schema | `single-appartement.php` | Apartment pages (the conversion pages) have **no** `Product`/`Offer`/`Residence`/`RealEstateListing` schema. |
| **AUD-06** | 🟠 HIGH | Plugin / Data Integrity | `functions.php:35-43` | "Active" listings chosen by a hardcoded exact-title whitelist instead of the `statut` field or a taxonomy. |
| **AUD-07** | 🟡 MEDIUM | Security | `header.php:11` | `wp_body_open()` hook missing (required since WP 5.2; breaks many plugins/GTM injectors). |
| **AUD-08** | 🟡 MEDIUM | SEO / Schema | `front-page.php:398-453` | Hardcoded FAQ JSON-LD; 2 questions no longer match the visible accordion text → invalid rich result. |
| **AUD-09** | 🟡 MEDIUM | Architecture | `front-page.php:30-127`, `page-location-…php:22-118` | ~100 lines of search-bar markup duplicated verbatim; no `get_template_part()`. |
| **AUD-10** | 🟡 MEDIUM | Performance / Maint. | `single-appartement.php:182-699`, `page-projets-location.php:249-363` | 500+ lines of inline `<style>` and inline `<script>` shipped per page instead of enqueued/minified assets. |
| **AUD-11** | 🟡 MEDIUM | Plugin / Data Integrity | `page-projets-location.php`, `functions.php`, `main.js:268` | Three competing sources of truth for project/sector: `projet`/`secteur` taxonomies, the `quartier`/`adresse` ACF text fields, and JS title-inference. |
| **AUD-12** | 🟡 MEDIUM | i18n / WPCS | All templates | No text domain, no `load_theme_textdomain()`, no `__()`/`esc_html__()`. Multilingual is currently impossible. |
| **AUD-13** | 🟡 MEDIUM | SEO | `page-location-…php` | The listings landing page has **no `<h1>`** (only an `<h2>`). |
| **AUD-14** | 🟡 MEDIUM | Maintainability | `functions.php` (whole) | Monolithic 690-line `functions.php` mixing CPT, ACF, admin UI, enqueues, SEO, term-meta. |
| **AUD-15** | 🟡 MEDIUM | Security | `functions.php:651-663` | `save_projet_image_field()` has no nonce verification (relies only on capability check). |
| **AUD-16** | 🟡 MEDIUM | Security | `main.js:423-488` | `grid.innerHTML = …` interpolates `u.unite` etc. unescaped (stored/self-XSS, defense-in-depth gap). |
| **AUD-17** | 🔵 LOW | WPCS | `footer.php:35` | `date('Y')` is not timezone-aware; use `wp_date('Y')`. |
| **AUD-18** | 🔵 LOW | WPCS | `style.css` header | Empty `Theme Name` / `Version` in the stylesheet header comment. |
| **AUD-19** | 🔵 LOW | Security | `single-appartement.php:152` | `$statut_class` echoed without `esc_attr()` (currently an internal value — hygiene). |
| **AUD-20** | 🔵 LOW | Extensibility | theme-wide | No child theme, no custom `do_action`/`apply_filters` hooks for overrides. |
| **AUD-21** | 🔵 LOW | Plugin | `footer.php:29`, `single-appartement.php:172` | CF7 form `id="26"` hardcoded in two templates. |
| **AUD-22** | 🔵 LOW | WPCS | `functions.php:2-6` | Thin `after_setup_theme`: no `html5`, `automatic-feed-links`, or `register_nav_menus()`. |
| **AUD-23** | 🔵 INFO | Performance | `header.php:6-8` | Render-blocking Google Fonts; consider `preload`/self-hosting + `font-display`. |
| **AUD-24** | 🔵 INFO | Performance | `screenshot.png` | 2.2 MB theme screenshot (spec is 1200×900, ~ a few hundred KB). |

---

## 3. Detailed Deep Dive

### 🔴 AUD-01 — Corrupted comment hides the entire projects grid

**Issue.** Line 116 of `page-projets-location.php` contains a mojibake artifact and an **opening `<!--` that is never closed** with `-->`:

```php
  <!-- �  <section class="projects-section">
    <div class="projects-inner">
      ...all four project cards...
    </div>
  </section>
</main>
```

PHP still *executes* server-side (the 8 queries run, wastefully), but to the **browser** everything from line 116 to the next `-->` (which never appears) is an HTML comment. The projects grid — and depending on the parser, the footer below it — silently disappears. This is a functional regression, almost certainly an editor encoding accident (the `�` was likely a `──` or emoji separator).

**Current code (`page-projets-location.php:116`):**
```php
  <!-- �  <section class="projects-section">
```

**Refactored:**
```php
  <!-- ── Projects Grid ── -->
  <section class="projects-section">
```

> Verify the rest of the file: ensure the `</section>`/`</main>` that follow now correctly pair, and load the page in a browser to confirm the four cards and footer render. Also sanity-check the file is saved as UTF-8.

---

### 🟠 AUD-02 — Apartment query + ACF reads run on every page load

**Issue.** `les_immeubles_qc_scripts()` is hooked to `wp_enqueue_scripts`, which fires on **every** front-end request. Inside it you run an unbounded `WP_Query` over all `appartement` posts and call `get_field()` ~7× per post — then `wp_localize_script()` ships the result to *every* page, including ones that never read `wpThemeData.units` (À propos, Le quartier, Mentions légales, single posts…). As the catalogue grows from 21 to hundreds of units, every page pays for it. There is no caching.

**Current code (`functions.php:26-119`, abridged):**
```php
function les_immeubles_qc_scripts() {
    wp_enqueue_style(...);
    wp_enqueue_script('les-immeubles-qc-main', ...);

    // Runs on EVERY page:
    $apt_query = new WP_Query(array(
        'post_type'      => 'appartement',
        'posts_per_page' => -1,
        ...
    ));
    while ($apt_query->have_posts()) {
        $apt_query->the_post();
        $prix = get_field('prix', $post_id); // ×7 fields per post
        ...
    }
    wp_localize_script('les-immeubles-qc-main', 'wpThemeData', array(... 'units' => $js_units));
}
```

**Refactored** — only build the heavy payload where it's needed, and cache it in a transient invalidated on save:

```php
function les_immeubles_qc_scripts() {
    wp_enqueue_style('les-immeubles-qc-style', get_stylesheet_uri(), array(),
        filemtime(get_stylesheet_directory() . '/style.css'));
    wp_enqueue_script('les-immeubles-qc-main', get_template_directory_uri() . '/main.js',
        array(), filemtime(get_template_directory() . '/main.js'), true);

    // URLs are cheap — always localize them so the nav works everywhere.
    $data = array(
        'homeUrl'            => esc_url(home_url('/')),
        'locationsUrl'       => liqc_page_url('location-appartements-etudiants-montreal'),
        'projetsUrl'         => liqc_page_url('projets-location'),
        'quartierUrl'        => liqc_page_url('le-quartier'),
        'aproposUrl'         => liqc_page_url('a-propos'),
        'mentionsLegalesUrl' => liqc_page_url('mentions-legales'),
        'themeUrl'           => esc_url(trailingslashit(get_template_directory_uri())),
        'units'              => array(),
    );

    // Only the front page and the listings page actually consume `units`.
    if (is_front_page() || is_page_template('page-location-appartements-etudiants-montreal.php')
        || is_page('location-appartements-etudiants-montreal')) {
        $data['units'] = liqc_get_active_units(); // cached, see below
    }

    wp_localize_script('les-immeubles-qc-main', 'wpThemeData', $data);
}
add_action('wp_enqueue_scripts', 'les_immeubles_qc_scripts');

/** Cached unit payload — see AUD-06 for the status-driven query. */
function liqc_get_active_units() {
    $cached = get_transient('liqc_active_units');
    if (false !== $cached) {
        return $cached;
    }
    $units = array();
    $q = new WP_Query(array(
        'post_type'              => 'appartement',
        'post_status'            => 'publish',
        'posts_per_page'         => 50,                 // bounded
        'meta_key'               => 'statut',
        'meta_value'             => 'Disponible',       // status-driven, not title-driven
        'orderby'                => 'title',
        'order'                  => 'ASC',
        'no_found_rows'          => true,
        'update_post_term_cache' => true,
    ));
    foreach ($q->posts as $post) {
        $id = $post->ID;
        // ACF reads here are fine: WP loads ALL meta for a post in one query (object-cached).
        $secteur = wp_get_post_terms($id, 'secteur', array('fields' => 'slugs'));
        $projet  = wp_get_post_terms($id, 'projet',  array('fields' => 'slugs'));
        $units[] = array(
            'unite'        => get_field('titre_affiche', $id) ?: get_the_title($id),
            'superficie'   => (int) get_field('superficie', $id),
            'chambres'     => sanitize_text_field((string) get_field('chambres', $id)),
            'sallesDeBain' => (int) get_field('salles_de_bain', $id) ?: 1,
            'prix'         => (int) get_field('prix', $id),
            'occupation'   => sanitize_text_field((string) get_field('occupation', $id)),
            'statut'       => sanitize_text_field((string) get_field('statut', $id)),
            'photo_1'      => esc_url((string) get_field('photo_1', $id)),
            'permalink'    => esc_url(get_permalink($id)),
            'projet'       => $projet[0]  ?? '',
            'secteur'      => $secteur[0] ?? '',
        );
    }
    wp_reset_postdata();
    set_transient('liqc_active_units', $units, DAY_IN_SECONDS);
    return $units;
}

/** Bust the cache whenever an apartment is saved/deleted. */
function liqc_flush_units_cache($post_id) {
    if (get_post_type($post_id) === 'appartement') {
        delete_transient('liqc_active_units');
        delete_transient('liqc_project_counts'); // see AUD-03
    }
}
add_action('save_post',   'liqc_flush_units_cache');
add_action('deleted_post','liqc_flush_units_cache');

/** Small helper to DRY up the page-URL resolution. */
function liqc_page_url($slug) {
    $page = get_page_by_path($slug);
    return esc_url($page ? get_permalink($page->ID) : home_url("/$slug/"));
}
```

> Note (Pillar 5): the concern about "`get_field()` in a loop" is mostly unfounded *per-post* — WP fetches a post's entire meta set in one cached query, so the 7 reads hit cache. The real cost is running the loop **on every page** and **never caching the assembled array** — which the transient fixes.

---

### 🟠 AUD-03 — Eight unbounded queries to print counts

**Issue.** `page-projets-location.php` instantiates **8** `WP_Query` objects, each `posts_per_page => -1`, purely to read `->found_posts`. They filter on `adresse` and `statut` **text meta** with `compare => '='` (unindexed `meta_value` lookups). This is 8 full result-set hydrations where you only want integers.

**Current code (`page-projets-location.php:5-43`, pattern repeats 4×):**
```php
$tupper_available = (new WP_Query([
  'post_type' => 'appartement', 'post_status' => 'publish', 'posts_per_page' => -1,
  'meta_query' => ['relation'=>'AND',
    ['key'=>'adresse','value'=>'1935 Rue Tupper','compare'=>'='],
    ['key'=>'statut','value'=>'Disponible','compare'=>'='],
  ],
]))->found_posts;

$tupper_total = (new WP_Query([ ... 'meta_query'=>[['key'=>'adresse','value'=>'1935 Rue Tupper']] ]))->found_posts;
// …×6 more for aubry / pigeon / anjou
```

**Refactored** — query the `projet` **taxonomy** once, ask only for IDs, and tally. Cache the result:

```php
<?php
$counts = liqc_get_project_counts(); // ['tupper' => ['total'=>17,'available'=>2,'name'=>'…'], ...]

function liqc_get_project_counts() {
    $cached = get_transient('liqc_project_counts');
    if (false !== $cached) return $cached;

    $out = array();
    foreach (get_terms(array('taxonomy' => 'projet', 'hide_empty' => false)) as $term) {
        $total = new WP_Query(array(
            'post_type'      => 'appartement',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'fields'         => 'ids',          // no post hydration
            'update_post_meta_cache' => false,
            'tax_query'      => array(array(
                'taxonomy' => 'projet', 'field' => 'slug', 'terms' => $term->slug,
            )),
        ));
        $available = new WP_Query(array(
            'post_type'      => 'appartement',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'tax_query'      => array(array(
                'taxonomy' => 'projet', 'field' => 'slug', 'terms' => $term->slug,
            )),
            'meta_key'   => 'statut',
            'meta_value' => 'Disponible',
        ));
        $out[$term->slug] = array(
            'total'     => (int) $total->found_posts,
            'available' => (int) $available->found_posts,
            'name'      => $term->name,
        );
    }
    set_transient('liqc_project_counts', $out, DAY_IN_SECONDS);
    return $out;
}
?>
...
<p class="proj-card-eyebrow">Projet · <?php echo (int) $counts['tupper']['total']; ?> logement<?php echo $counts['tupper']['total'] !== 1 ? 's' : ''; ?></p>
```

This is taxonomy-driven (see AUD-11), uses `'fields' => 'ids'`, and is cached (bust it in the same `save_post` hook from AUD-02). Even better long-term: pre-compute counts into term meta on save.

---

### 🟠 AUD-04 — Navigation is hardcoded in JavaScript

**Issue.** The entire primary menu lives in `main.js`:

```js
const navItems = [
  { label: "Accueil", href: wpThemeData.homeUrl },
  { label: "Locations d'appartements", href: wpThemeData.locationsUrl },
  ...
];
```

and `header.php` renders empty containers (`<nav id="nav-links"></nav>`) that JS fills. Consequences: the client **cannot edit the menu** in wp-admin; labels can't be translated (AUD-12); crawlers/no-JS users see no nav links; and it duplicates routing logic the CMS already owns.

**Refactored.** Register a menu location, output it server-side, and let JS handle *only* the interactive behaviour (dropdown/hamburger):

```php
// functions.php
add_action('after_setup_theme', function () {
    register_nav_menus(array(
        'primary' => __('Menu principal', 'les-immeubles-qc'),
        'footer'  => __('Menu pied de page', 'les-immeubles-qc'),
    ));
});
```
```php
// header.php — replace the empty <nav>
<?php
wp_nav_menu(array(
    'theme_location' => 'primary',
    'container'      => false,
    'menu_class'     => 'nav-links',
    'fallback_cb'    => false,
    'depth'          => 2,
));
?>
```

Then strip `navItems`, `buildDesktopNav()`, and `buildMobileNav()`'s *content generation* from `main.js`, keeping only the open/close handlers bound to the server-rendered markup. (If you want to keep the static-prototype mode working, gate the JS-built nav behind a static-mode check or keep a separate prototype script.)

---

### 🟠 AUD-05 — No structured data on apartment pages

**Issue.** `single-appartement.php` is where price, size, address, and availability live — exactly the data Google wants as structured data — yet there is no JSON-LD here. Rank Math's "Schema" + ACF modules are active but nothing maps the ACF fields into a schema. Meanwhile the homepage *does* ship a (stale) FAQ schema. The commercial pages are the ones missing it.

**Refactored** — emit an `Apartment`/`Offer` graph (real-estate-appropriate) from the ACF data:

```php
// single-appartement.php (inside the loop, after fields are read)
<?php
$schema = array(
    '@context' => 'https://schema.org',
    '@type'    => 'Apartment',
    'name'     => wp_strip_all_tags($titre_affiche),
    'url'      => get_permalink(),
    'numberOfRooms'   => (int) get_field('chambres'),
    'floorSize' => array(
        '@type' => 'QuantitativeValue',
        'value' => (int) get_field('superficie'),
        'unitText' => 'sqft',
    ),
    'address' => array(
        '@type' => 'PostalAddress',
        'streetAddress'   => wp_strip_all_tags(get_field('adresse')),
        'addressLocality' => 'Montréal',
        'addressRegion'   => 'QC',
        'addressCountry'  => 'CA',
    ),
);
if (get_field('statut') === 'Disponible' && get_field('prix')) {
    $schema['offers'] = array(
        '@type' => 'Offer',
        'price' => (int) get_field('prix'),
        'priceCurrency' => 'CAD',
        'availability'  => 'https://schema.org/InStock',
        'businessFunction' => 'http://purl.org/goodrelations/v1#LeaseOut',
    );
}
echo '<script type="application/ld+json">' .
     wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) .
     '</script>';
?>
```

> Alternatively, configure this entirely inside **Rank Math → Titles & Meta → `appartement`** using its ACF schema variables, which avoids hand-rolled JSON-LD and keeps it editable. Either approach closes the gap; do **not** ship both (duplicate schema).

---

### 🟠 AUD-06 — "Active" listings selected by exact title strings

**Issue.** The set of listings shown on the site is gated by a hardcoded array of exact titles in `functions.php`:

```php
$allowed_titles = array(
    '1935 Rue Tupper, apt. 16',
    '1935 Rue Tupper, app. 17',     // note: "apt." vs "app." — already inconsistent
    '2930 Rue Aubry (Top Floor)',
    ...
);
if (!in_array($title, $allowed_titles)) { continue; }
```

A single character in a post title (a stray space, `apt.` vs `app.`) silently removes a unit from the site, and the editor has no admin control over it. You already have a `statut` field that means exactly "is this available" — use it.

**Refactored.** Drop the whitelist entirely and query by `statut` (this is what `liqc_get_active_units()` in AUD-02 already does):

```php
'meta_key'   => 'statut',
'meta_value' => 'Disponible',
```

Now "showing on site" = "marked Disponible in the editor," which is self-documenting and client-manageable.

---

### 🟡 AUD-07 — `wp_body_open()` missing

```php
// header.php — required since WP 5.2; many plugins (GTM, consent, A/B) inject here
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
```

---

### 🟡 AUD-08 — Hardcoded FAQ schema drifted from visible text

**Issue.** Google requires FAQ schema text to match the on-page Q&A. Two no longer match:

| Visible accordion (`front-page.php`) | JSON-LD `name` |
|---|---|
| "Qu'est-ce qui est inclus dans le logement ?" | "Quelles sont les inclusions dans les appartements ?" |
| "Comment planifier une visite ?" | "Comment puis-je vous contacter pour une visite ?" |

This risks the FAQ rich result being rejected/penalised. **Fix:** make the schema a byproduct of the visible content — build one `$faqs` array, loop it to render the accordion, and `wp_json_encode()` the same array into the JSON-LD. One source of truth, guaranteed match. (Or manage FAQs via Rank Math's FAQ block and delete the hand-written script.)

---

### 🟡 AUD-09 / AUD-10 — Duplicated markup & inline assets

The ~100-line search bar is byte-for-byte duplicated in `front-page.php` and `page-location-…php`; `single-appartement.php` ships **517 lines of inline `<style>`** (182–699) plus an inline `<script>`, and `page-projets-location.php` carries another ~115-line `<style>`.

**Refactor:**
- Extract the search bar to `template-parts/search-bar.php` and call `get_template_part('template-parts/search-bar')` in both places (pass context via the args param to toggle the GET-form vs JS-form behaviour).
- Move the inline CSS into `style.css` (or a conditionally-enqueued `single-appartement.css`) so it's cached across page views and minified by your pipeline.
- Move the single-page carousel JS into `main.js` (it duplicates the homepage `showcaseGo` logic) and pass the photo array via a `data-photos` attribute or a small `wp_localize_script`.

---

### 🟡 AUD-11 — Three competing sources of truth for project/sector

You maintain: (1) real `projet`/`secteur` **taxonomies**, (2) `adresse` + `quartier` **ACF text fields**, and (3) **JS title-inference** (`main.js:268` `title.includes('aubry') ? 'aubry' : 'tupper'`). The projets page counts even ignore the taxonomy and match the `adresse` *string*. This guarantees eventual drift. **Decision needed:** make the **taxonomy authoritative**, derive everything (counts, JS filters, address labels) from it, and demote `quartier`/`adresse` to display-only free text.

---

### 🟡 AUD-12 — No internationalization

Every string is a hardcoded French literal. For future EN/FR support you need `load_theme_textdomain('les-immeubles-qc', get_template_directory().'/languages')` on `after_setup_theme`, and to wrap user-facing strings: `esc_html_e('Louer un appartement', 'les-immeubles-qc')`. This is a large but mechanical change; do it once now while the string count is small.

---

### 🟡 AUD-13 — Listings page has no `<h1>`

`page-location-…php` opens with `<p class="apt-eyebrow">` and an `<h2>` — there is no `<h1>` on a primary SEO landing page ("location-appartements-etudiants-montreal"). Promote the section heading to `<h1>` (or add a hero `<h1>`).

---

### 🟡 AUD-14 — Monolithic `functions.php`

690 lines mixing seven concerns. Split into:
```
functions.php          → requires the files below
inc/setup.php          → theme supports, menus, textdomain
inc/enqueue.php        → scripts/styles + localize (AUD-02)
inc/cpt-taxonomies.php → appartement CPT, secteur/projet, default terms
inc/admin-filters.php  → restrict_manage_posts + parse_query
inc/term-meta.php      → projet image uploader
inc/seo.php            → Rank Math breadcrumb filter + schema
```

---

### 🟡 AUD-15 — Term-meta save lacks a nonce

`save_projet_image_field()` checks `current_user_can('manage_categories')` (good) but verifies no nonce, so it's CSRF-shaped. Add a nonce field in the add/edit form callbacks and verify it:

```php
// in add/edit form callbacks:
wp_nonce_field('liqc_save_projet_img', 'liqc_projet_img_nonce');

// in save handler, before writing meta:
if (!isset($_POST['liqc_projet_img_nonce'])
    || !wp_verify_nonce($_POST['liqc_projet_img_nonce'], 'liqc_save_projet_img')) {
    return;
}
if (!current_user_can('manage_categories')) return;
$image_id = isset($_POST['projet_image_id']) ? absint($_POST['projet_image_id']) : 0;
```

---

### 🟡 AUD-16 — Unescaped `innerHTML` interpolation in `renderTable()`

`grid.innerHTML = data.map(u => \`…${u.unite}…${u.chambres}…\`)` injects DB/title values straight into markup, including `alt="${u.unite}"`. Today the data is admin-authored (low risk → stored self-XSS only), but it's a defense-in-depth gap and an attribute-injection vector if `unite` ever contains `"`. Escape on the way in:

```js
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// …
<h3 class="rental-card-title">${esc(u.unite)}</h3>
<img src="${encodeURI(imgUrl)}" alt="${esc(u.unite)}" ... />
```

---

### 🔵 LOW / INFO (condensed)

- **AUD-17:** `footer.php:35` → `wp_date('Y')` (respects site timezone).
- **AUD-18:** Fill in `style.css` header (`Theme Name: Les Immeubles QC`, `Version: 1.0.0`, `Text Domain`, `Author`).
- **AUD-19:** `single-appartement.php:152` → wrap `$statut_class` in `esc_attr()`.
- **AUD-20:** No child theme / no `do_action('liqc_after_unit_specs')`-style hooks — add extension points before launch hardening.
- **AUD-21:** Move CF7 IDs to a single constant/option (`get_option`) instead of hardcoding `id="26"` in two templates.
- **AUD-22:** Add `add_theme_support('html5', [...])`, `add_theme_support('automatic-feed-links')`, and the nav-menu registration from AUD-04.
- **AUD-23:** Self-host Bricolage Grotesque or `<link rel="preload">` it with `font-display: swap` to cut render-blocking.
- **AUD-24:** Re-export `screenshot.png` at 1200×900 (target < 300 KB).

---

## 4. Phased Action Roadmap

### ✅ Phase 1 — Stop the bleeding (Security & Quick Wins) — *~½ day*
1. **AUD-01** — Fix the corrupted comment; confirm projects grid + footer render. *(blocker)*
2. **AUD-07** — Add `wp_body_open()`.
3. **AUD-15** — Add nonce to the term-meta save handler.
4. **AUD-08** — Re-sync FAQ schema text to the visible accordion (or move to Rank Math).
5. **AUD-13** — Add the missing `<h1>` on the listings page.
6. **AUD-17 / AUD-18 / AUD-19** — Trivial hygiene fixes.

### ⚙️ Phase 2 — Performance & Architecture — *~2-3 days*
7. **AUD-02** — Conditional enqueue + transient-cached `liqc_get_active_units()` with `save_post` invalidation.
8. **AUD-03** — Collapse the 8 projets queries into cached, taxonomy-driven, `fields=>ids` counts.
9. **AUD-06** — Replace the title whitelist with the `statut`-driven query.
10. **AUD-04** — Migrate navigation to `register_nav_menus()` + `wp_nav_menu()`; thin out `main.js`.
11. **AUD-09 / AUD-10** — Extract `template-parts/search-bar.php`; move inline CSS/JS into enqueued assets.
12. **AUD-14** — Split `functions.php` into `inc/` modules.
13. **AUD-16** — Escape `innerHTML` interpolation.

### 🚀 Phase 3 — Advanced Schema, Data Model & Extensibility — *~2-3 days*
14. **AUD-05** — Add `Apartment`/`Offer` structured data to `single-appartement.php` (or Rank Math ACF schema).
15. **AUD-11** — Make the `projet`/`secteur` taxonomy the single source of truth; remove JS title-inference and `adresse`-string matching.
16. **AUD-12** — Introduce text domain + wrap strings for multilingual readiness.
17. **AUD-20 / AUD-22 / AUD-23 / AUD-24** — Child-theme scaffold, theme-support additions, font + screenshot optimization.

---

## Open Decisions (before Phase 2/3)

1. **Data model (AUD-11):** make `projet`/`secteur` taxonomies authoritative, keep ACF text as source, or leave as-is?
2. **Nav rewrite (AUD-04):** WP menu with JS fallback for the static prototype, WP menu only, or skip for now?
3. **Execution:** report only, apply Phase 1, or apply Phase 1 + 2?
