---
author: Freddy
pubDatetime: 2020-01-02T07:00:00.000Z
modDatetime: 2020-01-03T09:36:59.000Z
title: "Spring学习笔记 - Spring FactoryBean"
tags:
  - "Java"
  - "Spring"
description: "简述 org.springframework.beans.factory.FactoryBean<T> 是 Spring 容器提供的一种可以扩展容器对象实例化逻辑的接口。 FactoryBean ，其主语是Ben，定于为Factory，也就是说，它本身与其他注册到容器中的对象一样，只是一个Bean而已，只不过这种类型的"
---
<h4 id="简述">简述</h4><p><code>org.springframework.beans.factory.FactoryBean&lt;T&gt;</code>是<code>Spring</code>容器提供的一种可以扩展容器对象实例化逻辑的接口。<code>FactoryBean</code>，其主语是Ben，定于为Factory，也就是说，它本身与其他注册到容器中的对象一样，只是一个Bean而已，只不过这种类型的Bean本身就是生产对象的工厂。</p><h4 id="接口定义">接口定义</h4><p>它的接口定义如下</p>

```text
public interface FactoryBean<T> {
  @Nullable
  T getObject() throws Exception;
  @Nullable
  Class<?> getObjectType();
  default boolean isSingleton() {
    return true;
  }
}
```

<p><code>getObject()</code>方法会返回该<code>FactoryBean</code>“生产”的对象实例，我们需要实现该方法以给出自己的对象实例化逻辑；<code>getObjectType()</code>方法仅返回<code>getObject()</code>方法所返回的对象的类型，如果预先无法确定，则返回null；<code>isSingleton()</code>方法返回结果用于表明，工厂方法（<code>getObject()</code>）所“生产”的对象是否要以singleton形式存在于容器中。如果以singleton形式存在，则返回true，否则返回false； </p><h4 id="使用场景">使用场景</h4><p><code>FactoryBean</code>的一般使用场景是，当我们需要实例化一个比较复杂的Bean时，我们可以通过实现<code>FactoryBean</code>来定制Bean的实例化过程。</p><p>在IOC容器中，通过<code>getBean(BeanName)</code>方法获取Bean时，如果该Bean实现了<code>FactoryBean</code>接口，则获取到该Bean的实例为<code>getObjet()</code>方法返回的结果，并不是<code>FactoryBean</code>的实现类对象。</p><h4 id="使用示例">使用示例</h4><p>我们实现一个<code>FactoryBean</code>示例，我们将实现一个<code>ToolFactory</code>，它将产生Tool类型的实例对象。</p>

```java
public class Tool {
 
    private int id;
 
    // standard constructors, getters and setters
}
```

```java
public class ToolFactory implements FactoryBean<Tool> {
 
    private int factoryId;
    private int toolId;
 
    @Override
    public Tool getObject() throws Exception {
        return new Tool(toolId);
    }
 
    @Override
    public Class<?> getObjectType() {
        return Tool.class;
    }
 
    @Override
    public boolean isSingleton() {
        return false;
    }
 
    // standard setters and getters
}
```

<p>使<code>ToolFactory</code>生效（将<code>FactoryBean</code>的实现注册到IOC容器中），有以下两种方式：</p><ul><li><p>XML</p>

```xml
<beans ...>
 
    <bean id="tool" class="com.baeldung.factorybean.ToolFactory">
        <property name="factoryId" value="9090"/>
        <property name="toolId" value="1"/>
    </bean>
</beans>
```

</li><li><p>Java编码</p><p>与XML不同的是，我们需要显示的调用<code>getObject()</code>方法来生成实例对象。</p>

```java
@Configuration
public class FactoryBeanAppConfig {
  
    @Bean(name = "tool")
    public ToolFactory toolFactory() {
        ToolFactory factory = new ToolFactory();
        factory.setFactoryId(7070);
        factory.setToolId(2);
        return factory;
    }
 
    @Bean
    public Tool tool() throws Exception {
        return toolFactory().getObject();
    }
}
```

</li></ul><p>使用时，直接引入Tool实例对象即可</p>

```java
public class FactoryBeanTest {
    @Autowired
    private Tool tool;
 
    @Test
    public void test() {
        assertThat(tool.getId(), equalTo(1));
    }
}
```

