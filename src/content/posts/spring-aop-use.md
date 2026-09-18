---
author: Freddy
pubDatetime: 2020-01-06T08:30:00.000Z
modDatetime: 2020-01-06T09:31:43.000Z
title: "Spring学习笔记 - Spring AOP 使用"
tags:
  - "Java"
  - "Spring"
description: "定义 Aspect 定义一个Aspect，只需要我们定义一个最普通的POJO，然后在类上加上 @Aspect 注解即可。 1 2 3 @Aspect public class MyAspect { } 声明 Pointcut Pointcut 的声明，依附在 @Aspect 所标注的Asepct定义类之内，通过使用 @"
---
<h4 id="定义-Aspect">定义 Aspect</h4><p>定义一个Aspect，只需要我们定义一个最普通的POJO，然后在类上加上<code>@Aspect</code>注解即可。</p>

```java
@Aspect
public class MyAspect {
}
```

<h4 id="声明-Pointcut">声明 Pointcut</h4><p>Pointcut 的声明，依附在<code>@Aspect</code>所标注的Asepct定义类之内，通过使用<code>@Pointcut</code>注解，指定Pointcut表达式之后，将这个指定了相应表达式的注解标注到Aspect定义类的某个方法上即可。</p>

```java
@Aspect
public class MyAspect {
  @Pointcut("execution(void *.method1()) || execution(void *.method2())")
  public void pointcut1(){};
}
```

<p>Pointcut 声明包含两部分</p><ul><li>Pointcut Expression，切点表达式。它用来规定Pointcut匹配规则。</li><li>Pointcut Signature，切点签名。它是一个具体化的方法定义，是Pointcut Expression的载体。</li></ul>

```java
@Aspect
public class MyAspect {
  @Pointcut("execution(void *.method1())") //Pointcut Expression
  public void pointcut1(){}; //Pointcut Signature
}
```

<p>上面我们就简单定义了一个pointcut，它将匹配到所有方法名为method1且返回值为void的方法。</p><h5 id="Pointcut标志符（Pointcut-Designator）">Pointcut标志符（Pointcut Designator）</h5><p>上面例子<code>execution(void *.method1())</code>中的<code>execution</code>即为Pointcut标志符。它表明该Pointcut将以什么样的行为来匹配表达式。</p><ul><li><em>execution</em> - 匹配指定方法。</li><li><em>within</em> - 匹配指定类下所声明的所有方法。如<code>withIn(com.liuqitech.spring.aop.MoctTarget)</code>它将匹配<code>MockTarget</code>类中所有声明的方法。</li><li><em>this</em> - limits matching to join points (the execution of methods when using Spring AOP) where the bean reference (Spring AOP proxy) is an instance of the given type</li><li><em>target</em> - limits matching to join points (the execution of methods when using Spring AOP) where the target object (application object being proxied) is an instance of the given type</li><li><em>args</em> - 匹配参数满足要求的方法。如<code>args(com.liuqitech.spring.aop.domain.User)</code> 它将匹配所有仅有一个入参且类型为<code>com.liuqitech.spring.aop.domain.User</code>的方法（比如：<code>public boolean login(User user)&#123;...&#125;</code>、<code>public boolean isLogin(User)&#123;...&#125;</code>）</li><li><em><code>@target</code></em> - limits matching to join points (the execution of methods when using Spring AOP) where the target object (application object being proxied) is an instance of the given type</li><li><em><code>@args</code></em> - 匹配入参被某注解标注的方法。</li><li><em><code>@within</code></em> - 匹配使用了某注解的类下所有的方法。比如<code>@withIn(org.springframework.stereotype.Component)</code> 它将匹配所有使用了<code>@Component</code>注解的类下所有声明的方法。</li><li><em>@annotation</em> - 匹配使用了某注解的方法。</li></ul><h4 id="声明Advice">声明Advice</h4><p>它实际上就是使用<code>@Aspect</code>标注的Aspect定义类中的不同方法，只不过这些方法需要针对不同的Advice类型使用对应的注解进行标注。</p><ul><li>@Before，前置增强</li><li>@AfterReturning，后置增强，</li><li>@AfterThrowing，抛出增强</li><li>@After，Final增强</li><li>@Around，环绕增强</li><li>@DeclareParents，引介增强</li></ul><p>除了<code>@DeclareParents</code>比较不同之外，其他用于标注不同类型Advice的注解，全都是方法级别的注解定义，只能用于标注方法定义。同时，各种Advice最终织入到什么位置，是由相应的Pointcut定义决定的。所以我们需要为这些用于标注Advice的注解指定对应的Pointcut定义，可以直接使用的Pointcut表达式，也可以指定上面单独声明的@Pointcut类型的Pointcut Signature。</p>

```java
@Aspect
public class MyAspect {

  @Pointcut("execution(void *.method1()) || execution(void *.method2())")
  public void pointcut1(){};

  @Before("pointcut1()") //使用已经定义的Pointcut签名
  public void doSomething1() {
    System.out.println("do something 1...");
  }

  @After("execution(void *.method1())") //直接使用Pointcut表达式
  public void doSomething2() {
    System.out.println("do something 2...");
  }
}
```

<h5 id="AfterThrowing-示例">@AfterThrowing 示例</h5>

```java
@Aspect
public class AfterThrowingExample {

  @AfterThrowing(
    pointcut="com.xyz.myapp.SystemArchitecture.dataAccessOperation()",
    throwing="ex")
  public void doRecoveryActions(DataAccessException ex) {
    // ...
  }

}
```

<p>它有一个独特的属性<code>throwing</code>，通过它我们可以限定Advice定义方法的参数名，并在方法调用的时候，将相应的异常绑定到具体方法参数上。当然如果不需要访问具体异常，那么我们可以声明没有任何参数的方法。</p>

```java
@AfterThrowing(pointcut="com.xyz.myapp.SystemArchitecture.dataAccessOperation()")
  public void doRecoveryActions() {
    // ...
  }
```

<h5 id="AfterReturning-示例">@AfterReturning 示例</h5>

```java
@Aspect
public class AfterReturningExample {

  @AfterReturning(
    pointcut="com.xyz.myapp.SystemArchitecture.dataAccessOperation()",
    returning="retVal")
  public void doAccessCheck(Object retVal) {
    // ...
  }
  
}
```

<p>它也有一个独特的属性<code>returning</code>，它能获取方法的返回值。当然如果我们不需要方法返回值时，也可以去掉该属性。</p><h5 id="Around-示例">@Around 示例</h5>

```java
@Aspect
public class AroundExample {

  @Around("com.xyz.myapp.SystemArchitecture.businessService()")
  public Object doBasicProfiling(ProceedingJoinPoint pjp) throws Throwable {
    // start stopwatch
    Object retVal = pjp.proceed();
    // stop stopwatch
    return retVal;
  }

}
```

<p>该类型的方法定义中，第一个参数必须是<code>ProceedingJoinPoint</code>类型，我们需要通过ProceedingJoinPoint的proceed()方法继续执行调用链。</p><h4 id="Spring-AOP-相关笔记">Spring AOP 相关笔记</h4><p><a href="http://liuqitech.com/2020/01/03/spring-aop-concept/">Spring学习笔记 - Spring AOP 概述</a></p><p><a href="http://liuqitech.com/2020/01/06/spring-aop-use/">Spring学习笔记 - Spring AOP 使用</a></p>
