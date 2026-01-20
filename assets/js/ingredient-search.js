---
# This file is processed by Jekyll so it can use Liquid for correct paths
---
document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('ingredient-search-input');
  const results = document.getElementById('ingredient-search-results');
  let recipes = [];

  const indexUrl = '{{ "/recipes.json" | relative_url }}';

  fetch(indexUrl)
    .then(r => r.ok ? r.json() : Promise.reject('Network error'))
    .then(data => { recipes = data; })
    .catch(err => {
      console.error('Failed to load recipes.json:', err);
      if (results) results.innerHTML = '<p class="muted">Could not load recipe index.</p>';
    });

  // Normalize string for search
  function normalize(s) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  // Check if a recipe matches the query
  function matches(recipe, query) {
    if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return false;
    const ingText = normalize(recipe.ingredients.join(' '));
    return ingText.includes(query);
  }

  // Escape HTML for safe rendering
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[m]));
  }

  // Highlight search terms
  function highlight(text, query) {
    const escaped = escapeHtml(text);
    if (!query) return escaped;
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  // Render results
  function render(list, query) {
    if (!results) return;
    results.innerHTML = '';

    if (!query) {
      results.innerHTML = '<p class="muted">Enter an ingredient to search recipes.</p>';
      return;
    }

    if (list.length === 0) {
      results.innerHTML = '<p>No recipes found matching that ingredient.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'ingredient-search-list';

    list.forEach(r => {
      const li = document.createElement('li');
      li.className = 'ingredient-search-item';
      const title = `<a href="${r.url}">${escapeHtml(r.title)}</a>`;
      const snippet = `<div class="ingredients-snippet">${highlight((r.ingredients || []).join(', '), query)}</div>`;
      li.innerHTML = title + snippet;
      ul.appendChild(li);
    });

    results.appendChild(ul);
  }

  if (input) {
    input.addEventListener('input', function (e) {
      const query = normalize(e.target.value);
      const matched = query ? recipes.filter(r => matches(r, query)) : [];
      render(matched, query);
    });
  }
});
