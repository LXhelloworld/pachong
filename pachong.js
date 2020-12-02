var cheerio = require("cheerio");
var supA = require("superagent");
var charset = require("superagent-charset");
let mongoose = require('mongoose');
let Books = require('./books');

mongoose.connect('mongodb://127.0.0.1/ruedu',{ useNewUrlParser: true ,useUnifiedTopology: true},);

charset(supA);
let a=5;
let typeList = [];
let BYURL = "https://www.81zw.cc/xuanhuan/1.html";

function getTypeList() {
    /*supA.get(BYURL).charset('gbk').end((err,res)=>{
        let $ = cheerio.load(res.text);
        $('.fl_left li').each((index,item)=>{
            let tl = $(item).find('a').attr('href');
            typeList.push(tl);
        })
    });*/
    supA.get(BYURL).charset('gbk').end((err, res) => {
        let $ = cheerio.load(res.text);
        $('.fl_left li').each((index, item) => {
            let tl = $(item).find('a').attr('href');

            typeList.push(tl);
        });
    });
}

async function getBooksList(n,m) {
    let pageUrl = `http://www.biquge.info/list/${n}_${m}.html`;
    await supA.get(pageUrl).end((err,res)=>{
        if(err){
            console.log('n:'+(n+1))
            getBooksList((n+1),1)
        }else{
            let $ = cheerio.load(res.text);
            let books = [];
            $('#newscontent .l ul li').each((index,it)=>{
                let book = new Books({
                    url:$(it).find('.s2 a').attr('href'),
                    name:$(it).find('.s2 a').text(),
                })
                books.push(book);
                book.save(function (err,doc) {
                    if(err){
                        console.log("baocunshibai")
                    }else{
                        console.log("baocunchenggong")
                    }
                });
            });
            console.log('m:'+m)
            getBooksList(n,(m+1))
        }
    });
}
//getBooksList(1,1)
function f(n,m) {
    let pageUrl = `http://www.biquge.info/list/${n}_${m}.html`;
    return new Promise(async (resolve,reject)=>{
        await supA.get(pageUrl).timeout({
            response:6000,
            deadline:600000,
        }).end((err,res)=>{
            if(err){
                f((n+1),m)
                reject();
            }else{
                let $ = cheerio.load(res.text);
                let books = [];
                $('#newscontent .l ul li').each((index,it)=>{
                    let book = new Books({
                        url:$(it).find('.s2 a').attr('href'),
                        name:$(it).find('.s2 a').text(),
                    })
                    books.push(book);
                    book.save(function (err,doc) {
                        if(err){
                            console.log("baocunshibai")
                        }else{
                            console.log("baocunchenggong")
                        }
                    });
                });
                f(n,(m+1))
                resolve(books);
            }
        });
    })
}


function getMes(url){
    return new Promise((resolve,reject) => {
        supA.get(url).end((err,res)=>{
            let $ = cheerio.load(res.text);
            let book =new Books ({
                name:$('#info h1').text(),
                author:$('#info p').eq(0).text(),
                type:$('#info p').eq(1).text(),
                url:url,
                imgUrl:$('#fmimg img').attr('src'),
                syn:$('#intro p').text()
            });
            book.save(function (err,doc) {
                if(err){
                    console.log("baocunshibai")
                }else{
                    console.log("baocunchenggong")
                }
            });
            resolve();
        })
    })
}

function getRankList(){
    let rankList = [];
    supA.get("https://www.qidian.com/rank").end((err,res)=>{
        let $ = cheerio.load(res.text);
        $('.list_type_detective li a').each((index,item)=>{
            let rank = {
                rankName:$(item).text(),
                rankUrl:$(item).attr('href')
            }
            rankList.push(rank)
        })
        console.log(rankList);
    });
}
getRankList()