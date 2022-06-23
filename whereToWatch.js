// ==UserScript==
// @name         哪里看
// @namespace    http://tampermonkey.net/
// @version      0.1.0
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
        if (val[0] == 1) {
            createHTML(val[1])
            createCss()
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
                      </h2>
                      <ul>
                        <li>
                            <span>人人影视</span>
                            <span>
                                <a href=${url}>资源链接</a>
                            </span>
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
    }`

    GM_addStyle(css)
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
            console.log("resourceMovieId", resourceMovieId[0])
            // 提取电影 id
            const regexpMovieId = /[0-9]{5,5}/
            // 将数组元素 resourceMovieId 转换成字符串
            movieId = resourceMovieId.toString().match(regexpMovieId)
            console.log("movieId", movieId[0].toString())
            // 传递的数组
            let info = [1, "https://www.yysub.net/resource/list/" + movieId]
            resolve(info)
        },
        onerror: function (response) {
            console.log("请求失败");
            reject(0)
        }
    });
}

(function () {
    console.log("天行健，君子以自强不息！！！")

    getMovieNameFromDouBan()

})();