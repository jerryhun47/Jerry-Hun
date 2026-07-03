#!/bin/bash
sed -i 's/<\/head>/  <script>const t = localStorage.getItem("app-theme"); if (t) document.body.classList.add(t);<\/script>\n<\/head>/g' index.html
