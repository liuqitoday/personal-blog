---
author: Freddy
pubDatetime: 2021-02-07T07:00:00.000Z
modDatetime: 2021-02-07T08:35:52.000Z
title: "Spring DeferredResult 指南（译）"
tags:
  - "Java"
  - "Spring"
description: "1. 概述 在本教程中，我们将研究如何在 Spring MVC 使用 DeferredResult 类来执行异步请求处理。 Selvet 3.0 中已经引入了异步的支持，简单来说，它允许在请求接收器线程外的另一个线程中去处理该HTTP请求。 从 Spring 3.2 起，就可以使用 DeferredResult ，它帮"
---
<h2 id="1-概述">1. 概述</h2><p>在本教程中，我们将研究如何在<code>Spring MVC</code>使用 <em>DeferredResult</em> 类来执行异步请求处理。</p><p><code>Selvet 3.0</code>中已经引入了异步的支持，简单来说，它允许在请求接收器线程外的另一个线程中去处理该HTTP请求。</p><p>从<code>Spring 3.2</code>起，就可以使用<em>DeferredResult</em>，它帮助我们将长时间的计算过程从<code>http-worker</code>线程中分离到一个单独的线程中。</p><p>尽管其他线程将占用一些资源用于计算，但工作线程在此期间不会阻塞，仍然可以继续处理传入的客户端请求。</p><p>异步请求处理模型非常有用，因为它有助于在高负载时很好地扩展应用程序，特别是对于IO密集型操作。</p><h2 id="2-安装">2. 安装</h2><p>我们将使用一个 Spring Boot 应用作为例子。然后，我们将展示同步通信和使用<em>DeferredResult</em> 的异步通信，并使用例子比较异步是如何更好地适应高负载和IO密集型。</p><h2 id="3-阻塞的-REST-服务">3. 阻塞的 REST 服务</h2><p>我们以一个标准的阻塞的 REST 服务开始</p>

```text
@GetMapping("/process-blocking")
public ResponseEntity<?> handleReqSync() {
    // ...
    return ResponseEntity.ok("ok");
}
```

<p>这里的问题是，请求处理线程在处理完成返回结果前是一直被阻塞的，对于需要进行长时间的计算时这不是一个好的解决方案。</p><h2 id="4-使用-DeferredResult-非阻塞的-REST-服务">4. 使用 <em>DeferredResult</em> 非阻塞的 REST 服务</h2><p>为了避免阻塞，我们将使用基于回调的模型，我们将返回一个 <em>DeferredResult</em> 到 Servlet 容器中，来取代实际的返回结果。</p>

```text
@GetMapping("/async-deferredresult")
public DeferredResult<ResponseEntity<?>> handleReqDefResult() {
    log.info("Received async-deferredresult request");
    DeferredResult<ResponseEntity<?>> output = new DeferredResult<>();

    ForkJoinPool.commonPool().submit(() -> {
        log.info("Processing in separate thread");
        try {
            Thread.sleep(6000);
        } catch (InterruptedException e) {
        }
        output.setResult(ResponseEntity.ok("ok"));
    });

    log.info("servlet thread freed");
    return output;
}
```

<p>请求的处理逻辑在一个单独的线程中完成，并且完成之后调用  <em>DeferredResult</em> 类的 <em>setResult</em> 方法来设置实际结果。</p><p>下面是日志输出结果，看看是否按照我们的预期顺序输出</p>

```text
Received async-deferredresult request
servlet thread freed
Processing in separate thread
```

<p>在内部，将通知容器线程并将 HTTP 响应返回给给客户端。连接将由容器(servlet 3.0或更高版本)一直保持打开的状态，直到返回相应结果或超时。</p><h2 id="5-DeferredResult-回调">5. <em>DeferredResult</em> 回调</h2><p>我们可以使用<em>DeferredResult</em> 注册3种类型的回调：完成、超时与异常。</p><p>我们使用<code>onCompletion</code> 方法来定义一个异步请求完成时执行的代码块</p>

```text
deferredResult.onCompletion(() -> log.info("Processing complete"));
```

<p>为了限制请求的处理时间，我们可以在 <em>DeferredResult</em> 实例化时设置一个超时时间，并且可以使用<code>ontTimeout</code> 方法来注册一个自定义的代码块用来在超时后执行。</p>

```text
DeferredResult<ResponseEntity<?>> deferredResult = new DeferredResult<>(500L);

deferredResult.onTimeout(() ->
        deferredResult.setErrorResult(
                ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT)
                        .body("Request timeout occurred.")));
```

<p>我们还可以使用<code>onError</code> 方法来注册一个发生异常时的回调。</p>

```text
deferredResult.onError((Throwable t) -> {
    deferredResult.setErrorResult(
      ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("An error occurred."));
});
```

<h2 id="原文地址">原文地址</h2><p><a href="https://www.baeldung.com/spring-deferred-result">https://www.baeldung.com/spring-deferred-result</a></p>
