---
author: Freddy
pubDatetime: 2018-03-15T06:51:37.000Z
modDatetime: 2019-12-26T08:15:19.000Z
title: "设置HTTP(HTTPS)代理"
tags:
  - "网络"
description: "Java 设置 HTTP/HTTPS 代理的几种方式：系统属性、Proxy 对象，以及忽略证书校验的注意点。"
---
<h3 id="背景"><a href="#背景" class="headerlink" title="背景"></a>背景</h3><p>经常会遇到服务器端限制访问速度，常见的是限制IP，这时候我们就需要设置代理IP来解除这种限制。</p>
<h3 id="设置代理IP（多种实现方式）"><a href="#设置代理IP（多种实现方式）" class="headerlink" title="设置代理IP（多种实现方式）"></a>设置代理IP（多种实现方式）</h3><h4 id="设置系统属性方式"><a href="#设置系统属性方式" class="headerlink" title="设置系统属性方式"></a>设置系统属性方式</h4><p>发送HTTP请求前通过设置JVM中的系统属性来实现</p>

```java
// HTTP/HTTPS Proxy
System.setProperty("http.proxyHost", yourProxyIp);
System.setProperty("http.proxyPort", yourProxyProt);
System.setProperty("https.proxyHost", yourProxyIp);
System.setProperty("https.proxyPort", yourProxyProt);
```

<h4 id="使用HttpClient时设置代理"><a href="#使用HttpClient时设置代理" class="headerlink" title="使用HttpClient时设置代理"></a>使用HttpClient时设置代理</h4><p>直接引用HttpClient官方的示例代码进行说明</p>

```java
import org.apache.http.HttpHost;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

/**
 * How to send a request via proxy.
 *
 * @since 4.0
 */
public class ClientExecuteProxy {

    public static void main(String[] args)throws Exception {
        CloseableHttpClient httpclient = HttpClients.createDefault();
        try {
            HttpHost target = new HttpHost("httpbin.org", 443, "https");
            HttpHost proxy = new HttpHost("127.0.0.1", 8080, "http");

            RequestConfig config = RequestConfig.custom()
                    .setProxy(proxy)
                    .build();
            HttpGet request = new HttpGet("/");
            request.setConfig(config);

            System.out.println("Executing request " + request.getRequestLine() + " to " + target + " via " + proxy);

            CloseableHttpResponse response = httpclient.execute(target, request);
            try {
                System.out.println("----------------------------------------");
                System.out.println(response.getStatusLine());
                System.out.println(EntityUtils.toString(response.getEntity()));
            } finally {
                response.close();
            }
        } finally {
            httpclient.close();
        }
    }

}
```

