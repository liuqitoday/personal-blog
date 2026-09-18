---
author: Freddy
pubDatetime: 2019-10-09T02:20:00.000Z
modDatetime: 2019-10-12T08:27:51.000Z
title: "多租户的实现"
tags:
  - "Java"
  - "MySQL"
description: "多租户概述 多租户（Multi Tenancy/Tenant）是一种软件架构，其定义是：在一台服务器上运行单个应用实例，它为多个租户提供服务。 数据隔离方案 独立数据库 即一个租户一个数据库。 共享数据库，独立Schema 即多个或所有租户共享Database，但是每个租户一个Schema（也可叫做一个user）。 共"
---
<h4 id="多租户概述">多租户概述</h4><p>多租户（Multi Tenancy&#x2F;Tenant）是一种软件架构，其定义是：在一台服务器上运行单个应用实例，它为多个租户提供服务。</p><h4 id="数据隔离方案">数据隔离方案</h4><ol><li><p>独立数据库</p><p>即一个租户一个数据库。</p></li><li><p>共享数据库，独立Schema</p><p>即多个或所有租户共享Database，但是每个租户一个Schema（也可叫做一个user）。</p></li><li><p>共享数据库，共享Schema，共享数据表</p><p>即租户共享同一个Database、同一个Schema，但在表中增加租户标识的数据字段。</p></li></ol><h4 id="实现方式">实现方式</h4><p>在<code>MySQL</code>没用schema和database的区分，所以上述1、2两种方案大体一致。当前选择最低成本的<code>共享数据库，共享Schema，共享数据表</code>方案。后续讨论全部针对于方案3展开。</p><p>简单来说，意味着每条数据都需要区分出属于哪个租户。为了减少后期开发成本，需要为用户表以及用户相关的表全都增加租户标识的字段（如<code>tenantId</code>）。</p><p>此时涉及与租户相关的<code>SQL</code>都需要拼接<code>tenantId = ?</code>，若手动拼接，改造过程过于繁琐。此时我们想到的方案是根据当前用户所属的租户动态的拼接<code>SQL</code>，恰巧<code>MyBatis-Plus</code>为我们提供了这样功能的插件，仅需要简单的配置即可。</p><h4 id="MyBatis-Plus-的多租户-SQL-解析器配置">MyBatis-Plus 的多租户 SQL 解析器配置</h4><p>参考官方文档及demo <a href="https://mybatis.plus/guide/tenant.html">https://mybatis.plus/guide/tenant.html</a></p><p>此处贴一下核心配置</p>

```java
@MapperScan("com.liuqitech.demo.dao")
@Configuration
public class MyBatisConfig {

  /**
   * 多租户的标识字段
   */
  private static final String TENANT_ID_COLUMN = "TENANT_ID";

  /**
   * 忽略多租户的表名
   */
  private static final List<String> IGNORE_TENANT_TABLES = Lists
      .newArrayList("table1", "table2", "table3", "table4");

  @Bean
  public PaginationInterceptor paginationInterceptor() {
    PaginationInterceptor paginationInterceptor = new PaginationInterceptor();
    TenantSqlParser tenantSqlParser = new TenantSqlParser();
    tenantSqlParser.setTenantHandler(new TenantHandler() {
      @Override
      public Expression getTenantId(boolean where) {
      // TODO 此处的tenantId需要自己获取当前用户所属的租户
        String tenantId = "liuqitech";
        return new StringValue(tenantId);
      }

      @Override
      public String getTenantIdColumn() {
        return TENANT_ID_COLUMN;
      }

      @Override
      public boolean doTableFilter(String tableName) {
        return IGNORE_TENANT_TABLES.stream().allMatch(e -> e.equalsIgnoreCase(tableName));
      }
    });
    paginationInterceptor.setSqlParserList(Lists.newArrayList(tenantSqlParser));
    return paginationInterceptor;
  }

}
```

