---
title: Latest posts
eleventyExcludeFromCollections: true
---

<ul>
{% for post in collections.posts | reverse %}
  <li>
    <a href="{{ post.url }}" {% if page.url == post.url %} aria-current="true"{% endif %}>
      {% if page.url == post.url %}
        <svg class="docs-icon" focusable="false">
        <use href="/images/all.svg#icon-triangle-right"></use>
      </svg>                
      {% endif %}
      {{ post.data.title }}
    </a>
  </li>
{% endfor %}
</ul>