#!/usr/bin/env python
# coding: utf-8

import sys
import urllib2
import urlparse
import re
import string
import time
import json
from bs4 import BeautifulSoup
reload(sys)
sys.setdefaultencoding( "utf-8" )


class DoorInfo(object):
    JSESSIONID = ""
    doorCode = ""
    def __init__(self,JSESSIONID,doorCode):
        self.JSESSIONID = JSESSIONID
        self.doorCode = doorCode

    def toCookie(self):
        return "JSESSIONID=%s; doorCode=%s;"%(self.JSESSIONID,self.doorCode)

    def get_doorCode(self):
        return "doorCode=%s"%(self.doorCode)

    def get_JSESSIONID(self):
        return "JSESSIONID=%s"%(self.JSESSIONID)


class BarCodeInfo(object):

    InfoHeader = {
        "Host": "chinatrace.org",
        "Connection": "keep-alive",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36",
        "Referer": "http://chinatrace.org/",
        "Accept-Encoding": "gzip,deflate,sdch",
        "Accept-Language": "zh-CN,zh;q=0.8"
    }
    CodeHeader = {
        #"GET": "/randomCodeForTop.jsp?codeType=doorCode HTTP/1.1",
        "Host": "chinatrace.org",
        "Connection": "keep-alive",
        "Accept": "image/webp,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36",
        "Referer": "http://chinatrace.org/door/controller/SearchController/searchByProductCode.do?productCode=6936983800013&productCode1=&batchNo=&traceCode=&doorCode=FFHI",
        "Accept-Encoding": "gzip,deflate,sdch",
        "Accept-Language": "zh-CN,zh;q=0.8",
    }


    cookie = ""
    cookieUpdate = 0


    def __init__(self):
        self.cache = {}
        #self.get_identifying_code()
        pass


    def get_identifying_code(self): 
        temp = {}
        response = self.get_response("http://chinatrace.org/randomCodeForTop.jsp?codeType=doorCode",self.CodeHeader)
        if response == None:
            return None
        for x in response.info().getheader("Set-Cookie").split(" "):
            ctype,value = x.split("=")
            if ctype == "JSESSIONID":
                temp["JSESSIONID"] = value[:-1]
            elif ctype == "doorCode":
                temp["doorCode"] = value
        self.cookieUpdate = int(time.time())
        self.dinfo = DoorInfo(temp["JSESSIONID"],temp["doorCode"])
        self.InfoHeader["Cookie"] = self.dinfo.toCookie()
        return temp


    def get_code_info(self,code):
        if code in self.cache:
            return self.cache[code]
        reInfo = {}
        if int(time.time()) - self.cookieUpdate > 600:
            if self.get_identifying_code() == None:
                self.cookieUpdate = 0
                return {}
        print self.dinfo.toCookie()
        print self.dinfo.get_doorCode()
        print self.dinfo.get_JSESSIONID()
        url = "http://chinatrace.org/door/controller/SearchController/searchByProductCode.do?productCode=%s&productCode1=&batchNo=&traceCode=&%s"%(code,self.dinfo.get_doorCode())
        response = self.get_response(url,self.InfoHeader)
        html = None
        if response is not None:
            html = response.read()
        soup = BeautifulSoup(html,"html.parser")
        for x in [x.text.replace(" ",'').replace("\n","").split("：") for x in soup.select("#content1 li")]:
            if x[0] not in reInfo:
                if len(x) == 2:
                    reInfo[x[0]] = x[1]
                else:
                    reInfo[x[0]] = ""
        for x in [x.text.replace(" ",'').replace("\n","").split("：") for x in soup.select("#content2 li")]:
            if x[0] not in reInfo:
                if len(x) == 2:
                    reInfo[x[0]] = x[1]
                else:
                    reInfo[x[0]] = ""
        for k,v in reInfo.items():
            print k,v
        self.cache[code] = reInfo
        return reInfo

    def get_response(self,url,qheaders,timeout=30):
        try:
            request = urllib2.Request(url,headers=qheaders)
            response = urllib2.urlopen(request,timeout=timeout)
        except Exception, e:
            print e
            return None 
        return response

if __name__ == '__main__':
    bi = BarCodeInfo()
    bi.get_code_info(sys.argv[1])

