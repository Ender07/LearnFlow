import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  Calendar, 
  Download, 
  Share2, 
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MyCertificationCard({ certification, index }) {
  const getExpiryColor = (status) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-300';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getExpiryIcon = (status) => {
    switch (status) {
      case 'expired': return AlertTriangle;
      case 'expiring_soon': return Calendar;
      default: return CheckCircle;
    }
  };

  const ExpiryIcon = getExpiryIcon(certification.expiryStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group overflow-hidden h-full">
        <div className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500" />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <Badge className={`${getExpiryColor(certification.expiryStatus)} flex items-center gap-1`}>
              <ExpiryIcon className="w-3 h-3" />
              {certification.expiryStatus === 'expired' && 'Expired'}
              {certification.expiryStatus === 'expiring_soon' && `${certification.daysUntilExpiry} days left`}
              {certification.expiryStatus === 'active' && 'Valid'}
            </Badge>
          </div>
          
          <CardTitle className="text-lg leading-tight group-hover:text-yellow-600 transition-colors">
            {certification.title}
          </CardTitle>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {certification.issuing_authority}
            </Badge>
            {certification.earnedDate && (
              <Badge variant="outline" className="text-xs">
                Earned {format(new Date(certification.earnedDate), 'MMM yyyy')}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-slate-600 text-sm line-clamp-3 mb-4">
            {certification.description}
          </p>

          {/* Validity Information */}
          {certification.validity_period_months && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Valid for {certification.validity_period_months} months
                  {certification.daysUntilExpiry && certification.expiryStatus !== 'expired' && (
                    <span className="ml-1">({certification.daysUntilExpiry} days remaining)</span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Blockchain Credential Link */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <Button asChild variant="link" size="sm" className="w-full p-0 h-auto text-indigo-600 hover:text-indigo-700">
              <Link to={createPageUrl('BlockchainCredentials')}>
                <Shield className="w-3 h-3 mr-1" />
                View Blockchain Credential
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Renewal Information */}
          {certification.expiryStatus === 'expiring_soon' && certification.renewal_process_id && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700 mb-2">Renewal required soon</p>
              <Button asChild size="sm" variant="outline" className="w-full text-yellow-700 border-yellow-300 hover:bg-yellow-100">
                <Link to={createPageUrl(`ProcessExecution?id=${certification.renewal_process_id}`)}>
                  Start Renewal Process
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}