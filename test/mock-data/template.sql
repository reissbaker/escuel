SELECT * FROM test
<% if(test) { %>
  WHERE name IS NOT NULL
<% } %>
;
