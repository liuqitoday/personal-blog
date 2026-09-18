---
author: Freddy
pubDatetime: 2016-10-16T06:29:52.000Z
modDatetime: 2019-12-26T08:15:45.000Z
title: "MyBatis中OGNL表达式的强制对象类型"
tags:
  - "Java"
description: "MyBatis OGNL 把数字 0 判成 false 的原因，以及用 @type@ 强制对象类型的写法。"
---
<p>在使用MyBatis过程中可能会遇到如下问题</p>
<p>mapper.xml中，当type为数字类型并且值为0时，下面的if test判断为false</p>

```xml
<if test="type != null and type != ''">  
    and type = #{type}   
</if>  
```

<p>经过查阅相关资料发现MyBatis中if test的解析是使用的OGNL表达式。</p>

<p>下面贴以下<a href="https://commons.apache.org/proper/commons-ognl/language-guide.html">OGNL表达式</a>中关于对象类型强制转换的说明</p>

```text
Coercing Objects to Types
Here we describe how OGNL interprets objects as various types. See below for how OGNL coerces objects to booleans, numbers, integers, and collections.

Interpreting Objects as Booleans
Any object can be used where a boolean is required. OGNL interprets objects as booleans like this:

If the object is a Boolean, its value is extracted and returned;
If the object is a Number, its double-precision floating-point value is compared with zero; non-zero is treated as true, zero as false;
If the object is a Character, its boolean value is true if and only if its char value is non-zero;
Otherwise, its boolean value is true if and only if it is non-null.
Interpreting Objects as Numbers
Numerical operators try to treat their arguments as numbers. The basic primitive-type wrapper classes (Integer, Double, and so on, including Character and Boolean, which are treated as integers), and the "big" numeric classes from the java.math package (BigInteger and BigDecimal), are recognized as special numeric types. Given an object of some other class, OGNL tries to parse the object's string value as a number.

Numerical operators that take two arguments use the following algorithm to decide what type the result should be. The type of the actual result may be wider, if the result does not fit in the given type.

If both arguments are of the same type, the result will be of the same type if possible;
If either argument is not of a recognized numeric class, it will be treated as if it was a Double for the rest of this algorithm;
If both arguments are approximations to real numbers (Float, Double, or BigDecimal), the result will be the wider type;
If both arguments are integers (Boolean, Byte, Character, Short, Integer, Long, or BigInteger), the result will be the wider type;
If one argument is a real type and the other an integer type, the result will be the real type if the integer is narrower than "int"; BigDecimal if the integer is BigInteger; or the wider of the real type and Double otherwise.
Interpreting Objects as Integers
Operators that work only on integers, like the bit-shifting operators, treat their arguments as numbers, except that BigDecimals and BigIntegers are operated on as BigIntegers and all other kinds of numbers are operated on as Longs. For the BigInteger case, the result of these operators remains a BigInteger; for the Long case, the result is expressed as the same type of the arguments, if it fits, or as a Long otherwise.

Interpreting Objects as Collections
The projection and selection operators (e1.{e2} and e1.{?e2}), and the in operator, all treat one of their arguments as a collection and walk it. This is done differently depending on the class of the argument:

Java arrays are walked from front to back;
Members of java.util.Collection are walked by walking their iterators;
Members of java.util.Map are walked by walking iterators over their values;
Members of java.util.Iterator and java.util.Enumeration are walked by iterating them;
Members of java.lang.Number are "walked" by returning integers less than the given number starting with zero;
All other objects are treated as singleton collections containing only themselves.
```

<p>那么可以发现上面的判断中type为0时 type !&#x3D; ‘’其实是为false<br>，Number类型的0与空字符串’’进行比较时，0被转换成了空字符串。</p>
<p>其实规范代码这种问题是不存在的，Number类型是无需和空字符串进行判断的。把该条件去掉只需判断是否为null即可。</p>
