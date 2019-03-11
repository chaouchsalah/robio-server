# This package will contain the spiders of your Scrapy project
#
# Please refer to the documentation for information on how to create and manage
# your spiders.
import scrapy
from scrapy.spiders import Spider, Rule
from scrapy.linkextractors import LinkExtractor
from scrapy.selector import Selector
from tripAdvisor.items import TripadvisorItem

class TripAdvisorSpider(Spider):
    name = "TripAdvisor" # Name of the spider, to be used when crawling
    allowed_domains = ["tripadvisor.com"] # Where the spider is allowed to go
    start_urls = [
        "https://www.tripadvisor.com/Restaurants-g293736-Rabat_Rabat_Sale_Zemmour_Zaer_Region.html"
    ]
    counter = 0
    def parse(self, response):
        sel = Selector(response) # The XPath selector
        sites = sel.xpath('//div[@class="title"]/a/@href').extract()
        for i in range(len(sites)):
            site = "https://www.tripadvisor.com"+sites[i]
            req = scrapy.Request(site, callback=self.parse_resto_details)
            yield req
    def parse_resto_details(self, response):
        sel = Selector(response) # The XPath selector
        name = sel.xpath(
            '//div[contains(@class,"restaurantName")]/h1/text()'
        ).extract()
        name = name[0]
        address = sel.xpath(
            '//div[contains(@class,"businessListingContainer")]//span[@class="detail"]/span/text()'
        ).extract()
        address = ' '.join(address)
        phone = sel.xpath(
            '//div[contains(@class,"phone")]//span[contains(@class,"detail")]/text()'
        ).extract()
        phone = phone[0]
        yield {'address': address, 'name': name, 'phone': phone}
