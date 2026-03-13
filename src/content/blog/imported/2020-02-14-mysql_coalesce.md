---
title: "MySQL COALESCE 函数"
description: "介绍 COALESCE(value,...) Returns the first non- NULL value in the list, or NULL if there are no non- NULL values. 官方文档介绍的很清楚，该函数返回参数列表中第一个非NULL的值，如果没有非NULL的值则返回NU"
pubDate: "2020-02-14T03:26:00.000Z"
updatedDate: "2020-02-14T04:03:35.000Z"
permalink: "2020/02/14/mysql_coalesce"
category: "MySQL"
tags:
  - "MySQL"
---
<h4 id="介绍">介绍</h4><p><a href="https://dev.mysql.com/doc/refman/8.0/en/comparison-operators.html#function_coalesce"><code>COALESCE(value,...)</code></a>  </p><p>Returns the first non-<code>NULL</code> value in the list, or <code>NULL</code> if there are no non-<code>NULL</code> values.</p><p>官方文档介绍的很清楚，该函数返回参数列表中第一个非NULL的值，如果没有非NULL的值则返回NULL。</p><figure class="highlight plaintext"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line">mysql&gt; SELECT COALESCE(NULL,1);</span><br><span class="line">        -&gt; 1</span><br><span class="line">mysql&gt; SELECT COALESCE(NULL,NULL,NULL);</span><br><span class="line">        -&gt; NULL</span><br></pre></td></tr></table></figure><h4 id="应用实例">应用实例</h4><p>表中存在字段<code>create_time</code>、<code>update_time</code>，现在需要按更新时间倒序排序，由于更新时间可能为NULL，若为NULL时按创建时间排。</p><figure class="highlight plaintext"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">ORDER BY COALESCE(update_time, create_time) DESC</span><br></pre></td></tr></table></figure>
