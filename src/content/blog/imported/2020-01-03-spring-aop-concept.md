---
title: "Spring学习笔记 - Spring AOP 概述"
description: "AOP中涉及的概念 Joinpoint 在系统运行之前，AOP的功能模块都需要植入到OOP的功能模块中。所以，要进行这些植入过程，我们需要知道再系统的哪些执行点上进行织入操作，这些将要在其之上进行植入操作的系统执行点就称之为Joinpoint。 Pointcut Pointcut概念代表的是Joinpoint的表述方式"
pubDate: "2020-01-03T09:30:00.000Z"
updatedDate: "2020-01-06T09:31:39.000Z"
permalink: "2020/01/03/spring-aop-concept"
category: "Java"
tags:
  - "Java"
  - "Spring"
---
<h4 id="AOP中涉及的概念">AOP中涉及的概念</h4><ul><li><p>Joinpoint</p><p>在系统运行之前，AOP的功能模块都需要植入到OOP的功能模块中。所以，要进行这些植入过程，我们需要知道再系统的哪些执行点上进行织入操作，这些将要在其之上进行植入操作的系统执行点就称之为Joinpoint。</p></li><li><p>Pointcut</p><p>Pointcut概念代表的是Joinpoint的表述方式。将横切逻辑织入当前系统的过程中，需要参照Pointcut规定的Joinpoint信息，才可以知道应该往系统的哪些Joinpoint上织入横切逻辑。</p></li><li><p>Advice</p><p>Advice是单一横切关注点逻辑的载体，它代表将会织入到Joinpoint的横切逻辑。</p></li><li><p>Aspect</p><p>Aspect是对系统中的横切关注点逻辑进行模块化封装的AOP概念实体。通常情况下，Aspect可以包含多个Pointcut以及相关的Advice定义。</p></li><li><p>织入和织入器</p><p>织入（Weaving）的过程就是将横切逻辑融合到原系统中的过程。只有经过织入过程以后，以Aspect模块话的横切关注点才会集成到OOP的现存系统中。完成织入过程的“人”就称之为织入器（Weaver）。</p></li><li><p>目标对象</p><p>符合Pointcut所指定的条件，将在织入过程中被织入横切逻辑的对象，称之为目标对象（Target Object）。</p></li></ul><h4 id="Java-平台上的AOP实现机制">Java 平台上的AOP实现机制</h4><ul><li><p>动态代理</p><p>JDK 1.3之后，引入了动态代理（Dynamic Proxy）机制，可以在运行期间，为响应的接口（Interface）动态生成对应的代理对象。所以，我们可以将横切关注点逻辑封装到动态代理的InvocationHandler中，然后在系统的运行期间，根据横切关注点需要织入的模块位置，将横切逻辑织入到相应的代理类中。</p></li><li><p>动态字节码增强</p><p>我们知道，我们可以可以使用CGLIB等类似的动态字节码增强的工具库，在程序运行期间动态构建字节码class文件。这样我们可以为需要织入横切逻辑的模块类在运行期间通过动态字节码增强技术为这些系统模块类生成相应的子类，将横切逻辑假如到这些子类中。</p></li><li><p>Java代码生成</p><p>这种方式比较古老，不做了解。</p></li><li><p>自定义类加载器</p><p>所有的Java程序的class都要通过相应的类加载器（Classloader）加载到Java虚拟机之后才能运行。</p><p>所以我们可以通过自定义类加载器，在class文件加载到虚拟机的解析过程中，将横切逻辑织入到class文件中来达到目的。</p></li><li><p>AOL扩展</p><p>此处暂时略过，该方式我也不太了解。</p></li></ul><h4 id="Spring-AOP-的实现机制">Spring AOP 的实现机制</h4><p>Spring AOP 采用了动态代理机制和动态字节码增强技术来实现。</p><h4 id="Spring-AOP-相关笔记">Spring AOP 相关笔记</h4><p><a href="http://liuqitech.com/2020/01/03/spring-aop-concept/">Spring学习笔记 - Spring AOP 概述</a></p><p><a href="http://liuqitech.com/2020/01/06/spring-aop-use/">Spring学习笔记 - Spring AOP 使用</a></p>
