"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lock,
  Globe,
  AlertTriangle,
  Search,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Home,
  Shield,
  Star,
  AlertCircle,
} from 'lucide-react';

// Types
interface Website {
  id: string;
  url: string;
  title: string;
  content: string;
  securityLevel: SecurityLevel;
  risks: SecurityRisk[];
  isSafe: boolean;
}

interface SecurityRisk {
  type: RiskType;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

type SecurityLevel = 'secure' | 'warning' | 'dangerous';
type RiskType = 'phishing' | 'malware' | 'unsecured' | 'scam' | 'dataCollection' | 'adware' | 'man-in-the-middle';

interface PlayerStats {
  safetyScore: number;
  sitesVisited: number;
  risksAvoided: number;
  level: number;
}

const SafeBrowserSimulator: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('https://suspicious-shop.simulator/deals');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    safetyScore: 100,
    sitesVisited: 0,
    risksAvoided: 0,
    level: 1,
  });
  const [showSecurityAlert, setShowSecurityAlert] = useState<boolean>(false);
  const [securityMessage, setSecurityMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('browser');

  // Sample websites database
  const websites: Website[] = [
  {
    id: 'home',
    url: 'https://safe.browsing.simulator/home',
    title: 'Safe Browsing Home',
    content: 'Welcome to the Safe Browsing Simulator! Learn to identify and avoid online threats.',
    securityLevel: 'secure',
    risks: [],
    isSafe: true
  },
  {
    id: 'shop',
    url: 'https://suspicious-shop.simulator/deals',
    title: 'Amazing Deals Store',
    content: 'SUPER DISCOUNT! Enter your credit card details to claim your free prize!',
    securityLevel: 'dangerous',
    risks: [
      {
        type: 'phishing',
        description: 'This site is attempting to collect sensitive financial information.',
        severity: 'high'
      }
    ],
    isSafe: false
  },
  {
    id: 'news',
    url: 'https://trusted.news.simulator/articles',
    title: 'Trusted News Articles',
    content: 'Stay updated with verified and accurate news from reliable sources.',
    securityLevel: 'secure',
    risks: [],
    isSafe: true
  },
  {
    id: 'download',
    url: 'https://malicious-download.simulator/free-software',
    title: 'Free Software Hub',
    content: 'Download the best software for free. No registration required!',
    securityLevel: 'dangerous',
    risks: [
      {
        type: 'malware',
        description: 'This site contains malicious software that can harm your device.',
        severity: 'critical'
      }
    ],
    isSafe: false
  },
  {
    id: 'social',
    url: 'https://social-network.simulator/login',
    title: 'Social Network Login',
    content: 'Welcome back! Please enter your username and password.',
    securityLevel: 'warning',
    risks: [
      {
        type: 'phishing',
        description: 'Fake login page mimicking a popular social network.',
        severity: 'high'
      }
    ],
    isSafe: false
  },
  {
    id: 'ads',
    url: 'https://popups-and-ads.simulator',
    title: 'Popup Paradise',
    content: 'Enjoy our amazing content... once you close 15 popups!',
    securityLevel: 'warning',
    risks: [
      {
        type: 'adware',
        description: 'Intrusive ads that can lead to malicious sites.',
        severity: 'medium'
      }
    ],
    isSafe: false
  },
  {
    id: 'bank',
    url: 'https://secure.bank.simulator/account',
    title: 'Your Bank Account',
    content: 'Access your bank account safely and securely.',
    securityLevel: 'secure',
    risks: [],
    isSafe: true
  },
  {
    id: 'blog',
    url: 'https://tech-blog.simulator',
    title: 'Tech Enthusiast Blog',
    content: 'Read about the latest in technology and gadgets.',
    securityLevel: 'secure',
    risks: [],
    isSafe: true
  },
  {
    id: 'crypto',
    url: 'https://crypto-investments.simulator',
    title: 'Crypto Investments',
    content: 'Invest now and double your money overnight!',
    securityLevel: 'dangerous',
    risks: [
      {
        type: 'scam',
        description: 'Fake investment scheme to steal money or information.',
        severity: 'high'
      }
    ],
    isSafe: false
  },
  {
    id: 'public-wifi',
    url: 'http://unsecured-public-wifi.simulator',
    title: 'Public WiFi Portal',
    content: 'Connect to free public WiFi without any security.',
    securityLevel: 'warning',
    risks: [
      {
        type: 'man-in-the-middle',
        description: 'Unsecured connection vulnerable to interception.',
        severity: 'high'
      }
    ],
    isSafe: false
  }
];


  const getCurrentWebsite = (): Website | undefined => {
    return websites.find(site => site.url === currentUrl);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSite = websites.find(site => 
      site.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (targetSite) {
      visitWebsite(targetSite);
    } else {
      setSecurityMessage('Website not found in simulator database');
      setShowSecurityAlert(true);
    }
  };

  const visitWebsite = (site: Website) => {
    setCurrentUrl(site.url);
    setPlayerStats(prev => ({
      ...prev,
      sitesVisited: prev.sitesVisited + 1
    }));

    if (!site.isSafe) {
      setSecurityMessage(`Warning: ${site.risks[0]?.description}`);
      setShowSecurityAlert(true);
      setPlayerStats(prev => ({
        ...prev,
        safetyScore: Math.max(0, prev.safetyScore - 10)
      }));
    } else {
      setShowSecurityAlert(false);
      setPlayerStats(prev => ({
        ...prev,
        risksAvoided: prev.risksAvoided + 1
      }));
    }
  };

  const getSecurityIndicator = () => {
    const site = getCurrentWebsite();
    switch (site?.securityLevel) {
      case 'secure':
        return <Lock className="text-green-500" />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" />;
      case 'dangerous':
        return <AlertCircle className="text-red-500" />;
      default:
        return <Globe className="text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Safe Browsing Simulator
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">Level {playerStats.level}</Badge>
              <Badge variant="outline">Safety Score: {playerStats.safetyScore}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs defaultValue="browser" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browser">Browser</TabsTrigger>
              <TabsTrigger value="security">Security Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="browser" className="space-y-4">
              {/* Browser Controls */}
              <div className="flex items-center space-x-2 border-b pb-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Home className="h-4 w-4" />
                </Button>

                <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2">
                  <div className="flex-1 flex items-center border rounded-md px-2">
                    {getSecurityIndicator()}
                    <Input
                      type="text"
                      value={currentUrl}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 focus-visible:ring-0"
                      placeholder="Enter URL"
                    />
                  </div>
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                <Button variant="outline" size="icon">
                  <Star className="h-4 w-4" />
                </Button>
              </div>

              {/* Content Area */}
              <div className="min-h-[400px] border rounded-md p-4">
                {showSecurityAlert && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{securityMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="prose">
                  <h1>{getCurrentWebsite()?.title}</h1>
                  <p>{getCurrentWebsite()?.content}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Safety Progress</h3>
                    <Progress value={playerStats.safetyScore} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-semibold">Sites Visited</h4>
                      <p className="text-2xl">{playerStats.sitesVisited}</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-semibold">Risks Avoided</h4>
                      <p className="text-2xl">{playerStats.risksAvoided}</p>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold mb-2">Security Tips</h4>
                    <ul className="space-y-2">
                      <li>• Always check for HTTPS and the padlock icon</li>
                      <li>• Verify website URLs carefully</li>
                      <li>• Don't enter sensitive information on suspicious sites</li>
                      <li>• Watch for poor grammar and urgent requests</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafeBrowserSimulator;