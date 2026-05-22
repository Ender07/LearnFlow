import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Star, Lock, CheckCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BadgeCatalog({ badges, earnedBadgeIds }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const filteredBadges = useMemo(() => {
    let filtered = badges || [];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(badge => badge.category === selectedCategory);
    }
    
    if (showOnlyAvailable) {
      filtered = filtered.filter(badge => !earnedBadgeIds.includes(badge.id));
    }
    
    return filtered;
  }, [badges, selectedCategory, showOnlyAvailable, earnedBadgeIds]);

  const categories = useMemo(() => {
    if (!badges) return [];
    return [...new Set(badges.map(badge => badge.category))];
  }, [badges]);

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'award': return Award;
      case 'star': return Star;
      default: return Award;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'completion': return 'from-green-500 to-emerald-500';
      case 'collaboration': return 'from-blue-500 to-indigo-500';
      case 'expertise': return 'from-purple-500 to-pink-500';
      case 'milestone': return 'from-orange-500 to-red-500';
      case 'safety': return 'from-red-500 to-rose-500';
      case 'quality': return 'from-yellow-500 to-orange-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showOnlyAvailable ? "default" : "outline"}
              onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
            >
              {showOnlyAvailable ? 'Show All' : 'Show Available Only'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge, index) => {
          const IconComponent = getBadgeIcon(badge.icon);
          const isEarned = earnedBadgeIds.includes(badge.id);
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden ${
                isEarned ? 'ring-2 ring-green-200' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg relative ${
                      isEarned 
                        ? `bg-gradient-to-br ${getCategoryColor(badge.category)}`
                        : 'bg-slate-200'
                    }`}>
                      {isEarned ? (
                        <>
                          <IconComponent className="w-8 h-8 text-white" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <Lock className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <h3 className={`font-bold mb-2 ${isEarned ? 'text-slate-800' : 'text-slate-500'}`}>
                      {badge.title}
                    </h3>
                    <p className={`text-sm mb-4 ${isEarned ? 'text-slate-600' : 'text-slate-400'}`}>
                      {badge.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <Badge className={`${
                        isEarned 
                          ? `bg-gradient-to-r ${getCategoryColor(badge.category)} text-white`
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {badge.category}
                      </Badge>
                      <span className={isEarned ? 'text-slate-600' : 'text-slate-400'}>
                        +{badge.points} XP
                      </span>
                    </div>
                    {isEarned && (
                      <div className="mt-3">
                        <Badge className="bg-green-100 text-green-800">Earned</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Badges Found</h3>
            <p className="text-slate-500">
              Try adjusting your filters to see more badges.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}