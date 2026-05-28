# Plan d'implémentation : Filtres dynamiques basés sur les taxonomies WordPress

Ce document détaille la stratégie pour remplacer les filtres codés en dur de la barre de recherche par un système dynamique basé sur les **Taxonomies WordPress**. Ce système vous permettra d'ajouter, modifier ou supprimer des filtres (comme des quartiers ou des commodités) directement depuis l'administration de WordPress, sans toucher au code.

---

## 🎯 Objectif
Rendre la barre de recherche d'appartements entièrement dynamique en alimentant ses filtres (ex: Quartier/Secteur, Options/Inclusions) par des taxonomies WordPress personnalisées.

---

## 🛠️ Étape 1 : Enregistrer les taxonomies dans `functions.php`

Pour commencer, nous devons enregistrer les nouvelles taxonomies et les lier au Custom Post Type `appartement`. 

Ajoutez ce bloc de code dans le fichier `functions.php` de votre thème :

```php
/**
 * Enregistrer les taxonomies personnalisées pour les appartements
 */
function register_appartement_taxonomies() {
    // 1. Taxonomie "Quartiers" (Hiérarchique comme les catégories)
    $labels_quartier = array(
        'name'              => 'Quartiers / Secteurs',
        'singular_name'     => 'Quartier',
        'search_items'      => 'Rechercher des quartiers',
        'all_items'         => 'Tous les quartiers',
        'parent_item'       => 'Quartier parent',
        'parent_item_colon' => 'Quartier parent :',
        'edit_item'         => 'Modifier le quartier',
        'update_item'       => 'Mettre à jour le quartier',
        'add_new_item'      => 'Ajouter un nouveau quartier',
        'new_item_name'     => 'Nom du nouveau quartier',
        'menu_name'         => 'Quartiers / Secteurs',
    );

    $args_quartier = array(
        'hierarchical'      => true, // Permet des sous-quartiers si nécessaire
        'labels'            => $labels_quartier,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array('slug' => 'secteur'),
        'show_in_rest'      => true, // Requis pour l'éditeur Gutenberg
    );
    register_taxonomy('quartier', array('appartement'), $args_quartier);

    // 2. Taxonomie "Inclusions & Commodités" (Tours de filtres / Options)
    $labels_inclusion = array(
        'name'              => 'Inclusions / Services',
        'singular_name'     => 'Inclusion',
        'search_items'      => 'Rechercher des inclusions',
        'all_items'         => 'Toutes les inclusions',
        'edit_item'         => 'Modifier l\'inclusion',
        'update_item'       => 'Mettre à jour l\'inclusion',
        'add_new_item'      => 'Ajouter une nouvelle inclusion',
        'new_item_name'     => 'Nom de la nouvelle inclusion',
        'menu_name'         => 'Inclusions / Services',
    );

    $args_inclusion = array(
        'hierarchical'      => false, // Se comporte comme des étiquettes (tags)
        'labels'            => $labels_inclusion,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array('slug' => 'inclusion'),
        'show_in_rest'      => true,
    );
    register_taxonomy('inclusion', array('appartement'), $args_inclusion);
}
add_action('init', 'register_appartement_taxonomies');
```

---

## 🔌 Étape 2 : Envoyer les données des filtres au JavaScript principal

Pour que l'interface HTML de la page d'accueil ou de la page de recherche puisse afficher ces options, nous devons récupérer tous les termes existants dans la base de données et les injecter dans la variable JavaScript `wpThemeData` dans `functions.php`.

Modifiez la fonction `les_immeubles_qc_scripts()` existante pour inclure les taxonomies :

```php
// Récupérer dynamiquement tous les quartiers actifs
$quartiers_terms = get_terms(array(
    'taxonomy'   => 'quartier',
    'hide_empty' => true, // N'affiche que les quartiers contenant au moins 1 appartement actif
));

$quartiers_list = array();
foreach ($quartiers_terms as $term) {
    $quartiers_list[] = array(
        'slug' => $term->slug,
        'name' => $term->name,
    );
}

// Récupérer également les inclusions si vous souhaitez créer un filtre d'options
$inclusions_terms = get_terms(array(
    'taxonomy'   => 'inclusion',
    'hide_empty' => true,
));

$inclusions_list = array();
foreach ($inclusions_terms as $term) {
    $inclusions_list[] = array(
        'slug' => $term->slug,
        'name' => $term->name,
    );
}

// Ajoutez ces listes dans le tableau localisé :
wp_localize_script('les-immeubles-qc-main', 'wpThemeData', array(
    'homeUrl'      => $home_url,
    'locationsUrl' => $locations_url,
    // ... rest of parameters ...
    'quartiers'    => $quartiers_list,   // Injecté dynamiquement !
    'inclusions'   => $inclusions_list,  // Injecté dynamiquement !
));
```

---

## 🎨 Étape 3 : Rendre la barre de recherche HTML dynamique (`main.js` ou template HTML)

Au lieu d'écrire en dur les `<option>` dans votre code HTML, vous les générez dynamiquement via JavaScript au chargement de la page.

### 1. Structure HTML simplifiée
Dans votre fichier HTML/PHP, votre select de quartier se résume simplement à ceci :
```html
<select id="filter-quartier">
  <option value="">Tous les quartiers</option>
  <!-- Les options seront injectées ici par JS -->
</select>
```

### 2. Génération JavaScript dynamique dans `main.js`
Dans votre script d'initialisation de la recherche :

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const selectQuartier = document.getElementById('filter-quartier');
  
  if (selectQuartier && typeof wpThemeData !== 'undefined' && wpThemeData.quartiers) {
    wpThemeData.quartiers.forEach(quartier => {
      const option = document.createElement('option');
      option.value = quartier.slug;
      option.textContent = quartier.name;
      selectQuartier.appendChild(option);
    });
  }
});
```

---

## 📈 Bénéfices et Administration future

Une fois ce système en place, voici comment vous gérerez vos filtres de recherche sans jamais réécrire de code :

1. **Ajouter un quartier** : Allez dans *Appartements > Quartiers / Secteurs*, créez *"Plateau Mont-Royal"*. Il apparaît immédiatement dans la liste de choix de la barre de recherche.
2. **Assigner un appartement** : Dans l'éditeur de votre appartement, cochez simplement la case du quartier correspondant dans la barre latérale droite de WordPress.
3. **Nettoyage automatique** : Grâce au paramètre `'hide_empty' => true`, si vous n'avez temporairement plus d'appartements disponibles dans un secteur donné, ce secteur disparaît automatiquement des filtres de la barre de recherche pour éviter de frustrer les utilisateurs, et réapparaît dès que vous rajoutez un logement dans cette zone !
