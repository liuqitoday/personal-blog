---
author: Freddy
pubDatetime: 2020-11-03T10:00:00.000Z
modDatetime: 2021-01-14T10:38:02.000Z
title: "数组实现队列"
tags:
  - "Java"
description: "概述 队列 ，又称为 伫列 （queue）， 计算机科学 中的一种 抽象资料型别 ，是 先进先出 （FIFO, First-In-First-Out）的 线性表 。在具体应用中通常用 链表 或者 数组 来实现。队列只允许在后端（称为 rear ）进行插入操作，在前端（称为 front ）进行删除操作。 从上述的概念中我"
---
<h3 id="概述">概述</h3><p><strong>队列</strong>，又称为<strong>伫列</strong>（queue），<a href="https://zh.wikipedia.org/wiki/%E8%A8%88%E7%AE%97%E6%A9%9F%E7%A7%91%E5%AD%B8">计算机科学</a>中的一种<a href="https://zh.wikipedia.org/wiki/%E6%8A%BD%E8%B1%A1%E8%B3%87%E6%96%99%E5%9E%8B%E5%88%A5">抽象资料型别</a>，是<a href="https://zh.wikipedia.org/wiki/%E5%85%88%E9%80%B2%E5%85%88%E5%87%BA%E6%BC%94%E7%AE%97%E6%B3%95">先进先出</a>（FIFO, First-In-First-Out）的<a href="https://zh.wikipedia.org/wiki/%E7%BA%BF%E6%80%A7%E8%A1%A8">线性表</a>。在具体应用中通常用<a href="https://zh.wikipedia.org/wiki/%E9%93%BE%E8%A1%A8">链表</a>或者<a href="https://zh.wikipedia.org/wiki/%E6%95%B0%E7%BB%84">数组</a>来实现。队列只允许在后端（称为<em>rear</em>）进行插入操作，在前端（称为<em>front</em>）进行删除操作。</p><p>从上述的概念中我们可得知，<strong>队列</strong>两个主要的操作为<strong>入队</strong>(enqueue)与<strong>出队</strong>(dequeue)，入队为从队尾插入元素，出队为从队首去删除元素。</p><h3 id="数组实现队列">数组实现队列</h3><p>数组实现的队列即元素容器为数组，为了完成入队与出队列的操作，同时还需要两个指针来标记队首和队尾。</p>  <h3 id="代码实现">代码实现</h3>

```java
public class ArrayQueueTest {

    private final int[] items;
    /**
     * front 队首指针
     * rear 对尾指针
     * capital 队列容量
     */
    private int front, rear, capital;

    public ArrayQueueTest(Integer capital) {
        this.items = new int[capital];
        this.capital = capital;
        this.front = rear = 0;
    }

    /**
     * 从队尾插入元素
     *
     * @param item 元素
     */
    public void add(int item) {
        // 当前容量已满
        if (rear == capital) {
            if (front == 0) {
                throw new RuntimeException("队列已满");
            } else {
                // 所有元素向前移动一位
                for (int i = 0; i < items.length - 1; i++) {
                    items[i] = items[i + 1];
                }
                // 队尾指针向前移动一位，同时队首指针向前移动一位
                rear--;
                front--;
            }
        }
        items[rear] = item;
        rear++;
    }

    /**
     * 从队首取出元素
     *
     * @return 队首取出的元素
     */
    public int remove() {
        if (front == capital) {
            throw new RuntimeException("队列为空");
        }
        int item = items[front];
        front++;
        return item;
    }

    /**
     * 获取队列所有元素
     *
     * @return 队列所有元素数组
     */
    public int[] getItems() {
        int[] outItems = new int[rear - front];
        for (int i = 0; i < outItems.length; i++) {
            outItems[i] = items[front + i];
        }
        return outItems;
    }

    public static void main(String[] args) {
        ArrayQueueTest arrayQueue = new ArrayQueueTest(5);
        arrayQueue.add(1);
        arrayQueue.add(2);
        arrayQueue.add(3);
        arrayQueue.add(4);
        arrayQueue.add(5);
        System.out.println(Arrays.toString(arrayQueue.getItems()));

        for (int i = 0; i < 5; i++) {
            int removeItem = arrayQueue.remove();
            System.out.println(removeItem);
            System.out.println(Arrays.toString(arrayQueue.getItems()));
        }
        arrayQueue.add(8);
        System.out.println(Arrays.toString(arrayQueue.getItems()));
        arrayQueue.add(9);
        System.out.println(Arrays.toString(arrayQueue.getItems()));

//        for (int i = 10; i < 20; i++) {
//            arrayQueue.add(i);
//            System.out.println(Arrays.toString(arrayQueue.getItems()));
//        }
//        for (int i = 0; i < 10; i++) {
//            System.out.println(arrayQueue.remove());
//            System.out.println(Arrays.toString(arrayQueue.getItems()));
//        }
    }
}
```

