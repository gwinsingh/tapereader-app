---
title: "Figure test"
date: 2026-01-01
tags: [method]
summary: Every figure kind, for checking the look.
draft: true
---

Test page.

```figure
{ "kind": "bar", "title": "Fund against index, by year", "sub": "Net return, percent", "unit": "%",
  "x": ["1989","1990","1991","1992","1993","1994","1995","1996","1997","1998","1999","2000"],
  "series": [ {"name": "Fund", "values": [31.6, 29.6, 53.4, 68.6, 63.2, 3.9, 39.0, -1.5, 17.1, 12.4, 34.7, -15.5]}, {"name": "S&P 500", "values": [31.7, -3.1, 30.5, 7.6, 10.1, 1.3, 37.6, 23.0, 33.4, 28.6, 21.0, -9.1]} ],
  "note": "Test data." }
```

```figure
{ "kind": "bar", "title": "One series with sign colours", "unit": "%", "sign": true,
  "x": ["2018","2019","2020","2021","2022","2023","2024","2025"],
  "series": [ {"name": "Fund", "values": [14.6, 0.5, -12.6, 8.0, 9.5, -7.6, 11.3, 33.0]} ] }
```

```figure
{ "kind": "line", "title": "Policy rate", "sub": "Percent, year end", "unit": "%",
  "x": ["2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"],
  "series": [ {"name": "Fed funds", "values": [4.25,5.25,4.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.5,0.75,1.5,2.5,1.75,0.25,0.25,4.5,5.5,4.5,3.75]}, {"name": "10-year yield", "values": [4.4,4.7,4.0,2.2,3.8,3.3,1.9,1.8,3.0,2.2,2.3,2.4,2.4,2.7,1.9,0.9,1.5,3.9,3.9,4.6,4.1]} ],
  "marks": [["2008","Lehman"],["2020","Pandemic"]] }
```

```figure
{ "kind": "stack", "title": "Two portfolios", "bars": [ {"name": "60/40", "parts": [["Stocks",60],["Bonds",40]]}, {"name": "All-weather style", "parts": [["Stocks",30],["Long bonds",40],["Mid bonds",15],["Gold",7.5],["Commodities",7.5]]} ] }
```

```figure
{ "kind": "timeline", "title": "One day", "events": [["07:30","Bank buys sterling","About £300m, no effect."],["11:00","Rate raised to 12%"],["14:15","Rate raised to 15%","Announced for the next day."],["19:40","Exit announced"]] }
```

```figure
{ "kind": "flow", "title": "Horizontal flow", "dir": "h", "steps": [["Liquidity","What central banks are doing"],["Thesis","What changes in 18 months"],["Chart","Is price confirming"],["Size","Small, then large"]] }
```

```figure
{ "kind": "quadrant", "title": "Four environments", "xAxis": ["Inflation falling","Inflation rising"], "yAxis": ["Growth rising","Growth falling"],
  "cells": [["Stocks, corporate bonds","Best for equities"],["Commodities, inflation-linked bonds","Real assets lead"],["Government bonds","Rates fall"],["Gold, inflation-linked bonds","Stagflation"]] }
```

```figure
{ "kind": "hbar", "title": "Signed bars", "unit": "%", "sign": true, "rows": [["Stocks",-18.1],["Bonds",-13.0],["60/40",-16.1],["Macro index",9.0]] }
```
