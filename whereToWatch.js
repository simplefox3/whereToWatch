// ==UserScript==
// @name         哪里看
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  在豆瓣网页检索哪里可以看对应电影，电视剧
// @author       no name
// @match        https://movie.douban.com/subject/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douban.com
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      https://www.yysub.net/*
// @license      MIT
// ==/UserScript==

// 获取豆瓣页面电影资源标题
function getMovieNameFromDouBan() {
    let movieFullName = document.querySelector("#content > h1 > span").innerHTML
    let movieName = movieFullName.split(' ')[0]
    const returnAns = new Promise(function (resolve, reject) {
        getMovieId(movieName, resolve, reject)
    }).then(function (val) {
        console.log("返回值：", val)
        if (val[0] === 1) {
            createHTML(val[1])
            createCss()
            displayNoneByRes(val[0])
        } else if (val[0] === 0) {
            createHTML(val[1])
            createCss()
            displayNoneByRes(val[0])
        }
    })
}

// 生成 HTML
function createHTML(url) {
    // 获取豆瓣右侧栏节点
    let aside = document.querySelector(".aside")
    // 获取豆瓣片单推荐
    let subject_doulist = document.querySelector("#subject-doulist")
    // 创建自己的插件展示根节点
    let wrap = document.createElement("div")
    // 为该根节点添加类名
    wrap.classList.add("subject-wheretowatch")
    wrap.innerHTML = `<h2>
                        <i>哪里看</i>
                        · · · · · ·
                        <span class="p1">
                        (
                        <a href="https://github.com/Eternaldeath/whereToWatch/issues">纠错</a>
                        )
                        </span>
                      </h2>
                      <ul>
                        <li>
                            <span>人人影视</span>
                            <span>
                                <a href=${url}>资源链接</a>
                            </span>
                            <span>暂无资源</span>
                            <span></span>
                        </li>
                      </ul>`

    aside.insertBefore(wrap, subject_doulist)
}

// 生成基本 css 样式
function createCss() {
    const css = `.subject-wheretowatch{
        margin-bottom: 40px;
        word-wrap: break-word;
    }
    
    .subject-wheretowatch ul{
        border-top: 1px dashed #DDD;
        list-style: none;
    }
    
    .subject-wheretowatch li{
        padding: 4.5px 0;
        border-bottom: 1px dashed #DDD;
    }
    
    .p1{
        font: 13px Arial, Helvetica, sans-serif;
        line-height: 150%;
        color: #666666;
    }

    a:link{
        color: #37a;
        text-decoration: none;
    }

    a{
        cursor: pointer;
    }

    .none{
        display: none;
    }
    `

    GM_addStyle(css)
}

/* 
    根据返回值隐藏模块
*/
function displayNoneByRes(res) {
    let span = document.querySelectorAll(".subject-wheretowatch ul span")
    console.log(span)
    if (res === 1) {
        // 隐藏“暂无资源”
        span[2].style.cssText = 'display: none'
    } else if (res === 0) {
        // 隐藏“资源链接”
        span[1].style.cssText = 'display: none'
        span[2].style.cssText = 'color: #FF0000; font-weight: bold'
    }
}


// 获取人人影视电影的 Id
// 通过是否有 Id 来判断是否有资源
function getMovieId(movieName, resolve, reject) {
    GM_xmlhttpRequest({
        method: "GET",
        url: `https://www.yysub.net/search/index?keyword=${movieName}&search_type=`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        },
        data: "",
        onload: function (response) {
            console.log("请求成功")
            const regexpResourceId = /\/resource\/[0-9]+/
            let resourceMovieId = response.responseText.match(regexpResourceId)
            let info = new Array();
            if (resourceMovieId === null) {
                info = [0, ""]
            } else {
                console.log("resourceMovieId", resourceMovieId[0])
                // 提取电影 id
                const regexpMovieId = /[0-9]{5,5}/
                // 将数组元素 resourceMovieId 转换成字符串
                movieId = resourceMovieId.toString().match(regexpMovieId)
                console.log("movieId", movieId[0].toString())
                // 传递的数组
                info = [1, "https://www.yysub.net/resource/list/" + movieId]
            }

            resolve(info)
        },
        onerror: function (response) {
            console.log("请求失败");
            let info = [0, ""]
            reject(info)
        }
    });
}

(function () {
    getMovieNameFromDouBan()

})();