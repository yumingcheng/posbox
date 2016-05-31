#!/usr/bin/env python
#-*-coding:utf-8-*

import os.path
import re
import torndb
import tornado.auth
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.escape
import tornado.web
import unicodedata
import json
import time
import datetime
import barCode
from tornado.options import define, options


define("debug",default=True,help="Debug Mode",type=bool)
define("port", default=8888, help="run on the given port", type=int)
define("mysql_host", default="127.0.0.1:3306", help="posbox database host")
define("mysql_database", default="posbox", help="posbox database name")
define("mysql_user", default="root", help="posbox database user")
define("mysql_password", default="", help="posbox database password")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", MainHandler),
            (r"/auth/login", AuthLoginHandler),
            (r"/auth/logout", AuthLogoutHandler),
            (r"/sell", SellHandler),
            (r"/stocks", StocksHandler),
            (r"/goods/info", GoodsInfoHandler),
            (r"/goods/update", GoodsUpdateHandler),
            (r"/goods/simple", GoodsSimpleHandler),
            (r"/checkout", CheckoutHandler),
            (r"/vip", VipHandler),
            (r"/vip/info", VipInfoHandler),
            (r"/vip/update", VipUpdateHandler),
            (r"/vip/total", VipTotalHandler),
            (r"/vip/export", VipExportHandler),
            (r"/vip/page", VipPageHandler),
            (r".*", BaseHandler)
        ]
        settings = dict(
            cookie_secret="43OA11123JHSJHASEMGEJJFUYH7EQNP2XDTP1O/VO=",
            login_url="/auth/login",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=False,
            ui_modules={
                "NavbarUI": NavbarUI
            },
        )
        tornado.web.Application.__init__(self, handlers, **settings)
        self.db = torndb.Connection(host=options.mysql_host,database=options.mysql_database,user=options.mysql_user, password=options.mysql_password)
        self.codeinfo = barCode.BarCodeInfo()



class BaseHandler(tornado.web.RequestHandler):
    @property
    def db(self):
        return self.application.db

    @property
    def codeinfo(self):
        return self.application.codeinfo

    def get_current_user(self):
        email = self.get_secure_cookie("email")
        password = self.get_secure_cookie("password")
        if email is  None or  password is  None:
            return None
        if email == "hbgscym@163.com" and password == "123456":
            return email

    def write_error(self, status_code, **kwargs):
        if status_code == 404:
            self.render('404.html')
        elif status_code == 500:
            self.render('404.html')
        else:
            self.write('error:' + str(status_code))

class MainHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.redirect("/sell")

class AuthLoginHandler(BaseHandler):
    def get(self):    
        self.render('login.html')

    def post(self):
        password = self.get_argument("password")
        email = self.get_argument("email")
        print password,email
        if password == '123456' and email == "hbgscym@163.com":
            print "deng lu"
            self.set_secure_cookie("email", "hbgscym@163.com")
            self.set_secure_cookie("password", "123456")
            self.write("1")
        else:
            self.write("0")

class AuthLogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("email")
        self.clear_cookie("password")
        self.redirect("/auth/login")

class SellHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render("sell.html",activeSr="1")

class StocksHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render("stocks.html",activeSr="2")

class GoodsInfoHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        barcode = self.get_argument("barcode")
        curIndex = self.get_argument("curIndex")
        info = {"barcode":barcode,"name":"","brand":"","spec":"","classify":"","updated":"","has_num":0,"price":"","curIndex":curIndex,"new":"false"}
        queryReturn = self.db.query("select * from goods where barcode=%s",barcode)
        if len(queryReturn) == 0:
            onlineInfo = self.codeinfo.get_code_info(barcode)
            print onlineInfo
            info["name"] = onlineInfo.get(u"产品名称","")
            info["brand"] = onlineInfo.get(u"品牌","")
            info["spec"] = onlineInfo.get(u"商品规格","")
            info["classify"] = onlineInfo.get(u"产品分类","")
            info["updated"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            info["new"] =  "true"
        else:
            print queryReturn
            info["name"] = queryReturn[0]["name"]
            info["brand"] = queryReturn[0]["brand"]
            info["spec"] = queryReturn[0]["spec"]
            info["classify"] = queryReturn[0]["classify"]
            info["updated"] = queryReturn[0]["updated"].strftime('%Y-%m-%d %H:%M:%S')
            info["price"] = queryReturn[0]["price"]
            info["has_num"] = queryReturn[0]["num"]
        self.write(json.dumps(info))


class GoodsSimpleHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        barcode = self.get_argument("barcode")
        info = {"barcode":barcode,"name":"","brand":"","spec":"","classify":"","updated":"","has_num":0,"price":0,"success":0}
        queryReturn = self.db.query("select * from goods where barcode=%s",barcode)
        if len(queryReturn) == 0:
            return self.write(json.dumps(info))
        else:
            print queryReturn
            info["success"] = 1
            info["name"] = queryReturn[0]["name"]
            info["brand"] = queryReturn[0]["brand"]
            info["spec"] = queryReturn[0]["spec"]
            info["classify"] = queryReturn[0]["classify"]
            info["updated"] = queryReturn[0]["updated"].strftime('%Y-%m-%d %H:%M:%S')
            info["price"] = queryReturn[0]["price"]
            info["has_num"] = queryReturn[0]["num"]
        self.write(json.dumps(info))



class GoodsUpdateHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        data = self.request.body
        print "----------->",data
        obj = None 
        try:
            obj = json.loads(data)
        except Exception, e:
            self.write("0")
            return 
        if obj is not None:
            for goods in obj['goods']:
                barcode = goods["barcode"]
                name = goods["name"]
                classify = goods["classify"]
                brand = goods["brand"]
                spec  = goods["spec"]
                new_num= goods["new_num"]
                price =  goods["price"]
                dbBarCode = self.db.query("select barcode from goods where barcode = %s",barcode)
                print dbBarCode
                if len(dbBarCode) == 0 :
                    print "INSERT"
                    self.db.execute("INSERT INTO goods (barcode,brand,name,spec,classify,num,price) VALUES(%s,%s,%s,%s,%s,%s,%s)",barcode,brand,name,spec,classify,new_num,price)              
                else:
                    print "UPDATE"
                    self.db.execute("UPDATE goods SET brand=%s,name=%s,spec=%s,classify=%s,num = num + %s,price = %s where barcode =%s",brand,name,spec,classify,new_num,price,barcode)
        self.write("0")
        

class VipHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render("vip.html",activeSr="3")

class VipInfoHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        cardnumber = self.get_argument("cardnumber")
        queryReturn = self.db.query("select * from vips where cardnumber = %s",cardnumber.upper())

        if len(queryReturn) == 0:
            return self.write(json.dumps({"success":"false","cardnumber":cardnumber}))
        reQuery = queryReturn[0]
        reQuery["updated"] = reQuery["updated"].strftime('%Y-%m-%d %H:%M:%S')
        reQuery["success"] = "true"
        self.write(json.dumps(reQuery))

class VipTotalHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        resp = {"total":0,"vips":None}
        points = int(self.get_argument("points"))
        total = self.db.query("SELECT COUNT(*) as count FROM vips where points >=%s;",points)
        print total[0]["count"]
        queryReturn = self.db.query("SELECT * FROM vips where points >= %s ORDER BY points DESC,cardnumber LIMIT %s, %s ",points,0,20)
        for entry in queryReturn:
            entry["updated"] = entry["updated"].strftime('%Y-%m-%d %H:%M:%S')
        resp["total"] =  total[0]["count"]
        resp["vips"] = queryReturn
        self.write(json.dumps(resp))

class VipPageHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        resp = {"page":0,"vips":None}
        points = int(self.get_argument("points"))
        page = int(self.get_argument("page"))
        queryReturn = self.db.query("SELECT * FROM vips where points >= %s ORDER BY points DESC,cardnumber LIMIT %s, %s ",points,(page-1)*20,20)
        for entry in queryReturn:
            entry["updated"] = entry["updated"].strftime('%Y-%m-%d %H:%M:%S')
        resp["page"] =  page
        resp["vips"] = queryReturn
        self.write(json.dumps(resp))

class VipUpdateHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        data = self.request.body
        print "----------->",data
        #{"vipcode":"aa","name":"猫","phonenumber":"191","points":"10"}
        obj = None 
        resp = {"success":"false"}
        try:
            obj = json.loads(data)
        except Exception, e:
            self.write(json.dumps(resp))
            return 
        vipcode = obj["vipcode"]
        name = obj["name"]
        phonenumber = obj["phonenumber"]
        points = int(obj["points"])

        cardnumber = self.db.execute("INSERT INTO  vips (cardnumber,name,phonenumber,points) values(%s,%s,%s,%s) ON DUPLICATE KEY UPDATE  name=%s,phonenumber=%s,points=%s;",vipcode.upper(),name,phonenumber,points,name,phonenumber,points)
        resp["cardnumber"] = vipcode
        resp["success"] = "true"
        self.write(json.dumps(resp))

class VipExportHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        resp = {"total":0,"vips":None}
        points = int(self.get_argument("points"))
        totalVips = self.db.query("SELECT * FROM vips where points >= %s ORDER BY points DESC,cardnumber;",points)
        self.set_header ('Content-Type', 'application/octet-stream')
        self.set_header ('Content-Disposition', 'attachment; filename='+str(points)+".txt")
        for vip in totalVips:
            self.write("\t".join([vip["cardnumber"],vip["name"],vip["phonenumber"],str(vip["points"]),vip["updated"].strftime('%Y-%m-%d %H:%M:%S')]) + '\n')
        self.finish()


class CheckoutHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        data = self.request.body
        try:
            print data
            obj = json.loads(data)
            print obj
            cardnumber = obj['r_customer_info']
            total_points = obj['total_points']
            total_saving = obj['total_saving']
            total_sale_price = obj['total_sale_price']
            total_list_price = obj['total_list_price']
            stime = time.strftime('%Y-%m-%d %H:%M:%S')
            # updateSql = "UPDATE vips SET points = points +  %d WHERE vips.cardnumber = '%s';"%(total_points,cardnumber)
            updataReturn = self.db.update("UPDATE vips SET points = points +  %s WHERE vips.cardnumber = %s",total_points,cardnumber.upper())
            cardnumber  = cardnumber.upper()
            print "updataReturn->",updataReturn
            if updataReturn == 0:
                cardnumber = None
            insertReturn = self.db.execute("INSERT INTO orders (cardnumber,sale_price,list_price,saving,ordertime) VALUES(%s,%s,%s,%s,%s)",cardnumber,total_sale_price,total_list_price,total_saving,stime)
            print insertReturn
            for goods in obj['goods']:
                barcode = goods["barcode"]
                discount = goods["discount"]
                sale_price = goods["sale_price"]
                count = goods["count"]
                print insertReturn,barcode,discount,sale_price,count
                self.db.execute("INSERT INTO order_detail (orderid,barcode,discount,sale_price,sale_num) VALUES(%s,%s,%s,%s,%s);",insertReturn,barcode,discount,sale_price,count)
            self.write("1")
        except Exception, e:
            self.write("0")




class NavbarUI(tornado.web.UIModule):                                                              
    def render(self,activeSr):
        return self.render_string("modules/navbar.html",activeSr=activeSr)
                   

def main():
    tornado.options.parse_command_line()
    app = Application()
    app.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
