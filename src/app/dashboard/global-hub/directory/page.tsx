"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Search,
  Filter,
  Building2,
  Clock,
  Phone,
  Mail,
  Globe,
  Navigation,
  Car,
  Utensils,
  Coffee
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface LocationEntry {
  id: string;
  name: string;
  type: "office" | "warehouse" | "field" | "partner" | "vendor";
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  office_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  facilities: {
    parking: boolean;
    restaurant: boolean;
    conference_rooms: number;
    wifi: boolean;
    generator: boolean;
  };
  staff_count?: number;
  primary_contact?: {
    name: string;
    title: string;
    phone?: string;
    email?: string;
  };
  notes?: string;
}

interface ServiceProvider {
  id: string;
  name: string;
  category: "restaurant" | "hotel" | "transport" | "medical" | "emergency" | "utility" | "other";
  description: string;
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
  };
  rating?: number;
  operating_hours?: string;
  services: string[];
}

export default function DirectoryPage() {
  const { user } = usePermissions();
  const [activeTab, setActiveTab] = useState<"locations" | "services">("locations");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [locations, setLocations] = useState<LocationEntry[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock location data
  const mockLocations: LocationEntry[] = [
    {
      id: "1",
      name: "AHNI Headquarters",
      type: "office",
      address: {
        street: "Plot 1234, Central Business District",
        city: "Abuja",
        state: "FCT",
        country: "Nigeria",
        postal_code: "900001"
      },
      coordinates: {
        lat: 9.0579,
        lng: 7.4951
      },
      contact: {
        phone: "+234-9-123-4567",
        email: "info@ahni.org",
        website: "https://www.ahni.org"
      },
      office_hours: {
        monday: "8:00 AM - 5:00 PM",
        tuesday: "8:00 AM - 5:00 PM",
        wednesday: "8:00 AM - 5:00 PM",
        thursday: "8:00 AM - 5:00 PM",
        friday: "8:00 AM - 5:00 PM"
      },
      facilities: {
        parking: true,
        restaurant: true,
        conference_rooms: 5,
        wifi: true,
        generator: true
      },
      staff_count: 45,
      primary_contact: {
        name: "Dr. Sarah Johnson",
        title: "Executive Director",
        phone: "+234-9-123-4567",
        email: "s.johnson@ahni.org"
      },
      notes: "Main administrative center with executive offices, finance, HR, and operations departments."
    },
    {
      id: "2",
      name: "AHNI Lagos Office",
      type: "office",
      address: {
        street: "15 Adeola Odeku Street, Victoria Island",
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
        postal_code: "101241"
      },
      contact: {
        phone: "+234-1-234-5678",
        email: "lagos@ahni.org"
      },
      office_hours: {
        monday: "8:00 AM - 5:00 PM",
        tuesday: "8:00 AM - 5:00 PM",
        wednesday: "8:00 AM - 5:00 PM",
        thursday: "8:00 AM - 5:00 PM",
        friday: "8:00 AM - 5:00 PM"
      },
      facilities: {
        parking: false,
        restaurant: false,
        conference_rooms: 2,
        wifi: true,
        generator: true
      },
      staff_count: 12,
      primary_contact: {
        name: "David Miller",
        title: "Program Manager",
        phone: "+234-1-234-5678",
        email: "d.miller@ahni.org"
      }
    },
    {
      id: "3",
      name: "AHNI Kano Field Office",
      type: "field",
      address: {
        street: "456 Ibrahim Taiwo Road",
        city: "Kano",
        state: "Kano",
        country: "Nigeria"
      },
      contact: {
        phone: "+234-64-123-456",
        email: "kano@ahni.org"
      },
      office_hours: {
        monday: "8:00 AM - 4:00 PM",
        tuesday: "8:00 AM - 4:00 PM",
        wednesday: "8:00 AM - 4:00 PM",
        thursday: "8:00 AM - 4:00 PM",
        friday: "8:00 AM - 4:00 PM"
      },
      facilities: {
        parking: true,
        restaurant: false,
        conference_rooms: 1,
        wifi: true,
        generator: false
      },
      staff_count: 8,
      primary_contact: {
        name: "Lisa Thompson",
        title: "M&E Specialist",
        phone: "+234-64-123-456",
        email: "l.thompson@ahni.org"
      }
    },
    {
      id: "4",
      name: "Central Warehouse",
      type: "warehouse",
      address: {
        street: "Industrial Layout, Lugbe",
        city: "Abuja",
        state: "FCT",
        country: "Nigeria"
      },
      contact: {
        phone: "+234-9-987-6543",
        email: "warehouse@ahni.org"
      },
      facilities: {
        parking: true,
        restaurant: false,
        conference_rooms: 0,
        wifi: false,
        generator: true
      },
      staff_count: 6,
      notes: "Main storage facility for program supplies and equipment."
    }
  ];

  // Mock service providers
  const mockServices: ServiceProvider[] = [
    {
      id: "1",
      name: "Sheraton Abuja Hotel",
      category: "hotel",
      description: "Premium business hotel with conference facilities",
      contact: {
        phone: "+234-9-461-3000",
        email: "reservations@sheraton-abuja.com",
        website: "https://sheraton-abuja.com"
      },
      address: {
        street: "Ladi Kwali Way, Maitama",
        city: "Abuja",
        state: "FCT"
      },
      rating: 4.5,
      operating_hours: "24/7",
      services: ["Accommodation", "Conference Rooms", "Restaurant", "Parking", "WiFi", "Airport Shuttle"]
    },
    {
      id: "2",
      name: "ABC Transport Services",
      category: "transport",
      description: "Reliable transportation services for staff and visitors",
      contact: {
        phone: "+234-803-123-4567",
        email: "info@abctransport.ng"
      },
      address: {
        street: "Area 11, Garki",
        city: "Abuja",
        state: "FCT"
      },
      rating: 4.2,
      operating_hours: "6:00 AM - 10:00 PM",
      services: ["Airport Transfer", "Staff Transport", "Vehicle Rental", "Event Transportation"]
    },
    {
      id: "3",
      name: "Transcorp Hilton Abuja",
      category: "restaurant",
      description: "Fine dining and catering services",
      contact: {
        phone: "+234-9-461-5000",
        website: "https://transcorphotels.com"
      },
      address: {
        street: "1 Aguiyi Ironsi Street, Maitama",
        city: "Abuja",
        state: "FCT"
      },
      rating: 4.7,
      operating_hours: "6:00 AM - 12:00 AM",
      services: ["Fine Dining", "Catering", "Conference Meals", "Room Service"]
    },
    {
      id: "4",
      name: "National Hospital Abuja",
      category: "medical",
      description: "Premier medical facility for emergency and routine care",
      contact: {
        phone: "+234-9-523-4000",
        email: "info@nationalhospital.gov.ng"
      },
      address: {
        street: "Plot 132, Central District",
        city: "Abuja",
        state: "FCT"
      },
      operating_hours: "24/7 Emergency",
      services: ["Emergency Care", "Specialist Consultations", "Medical Examinations", "Laboratory Services"]
    },
    {
      id: "5",
      name: "Emergency Services",
      category: "emergency",
      description: "Police, Fire, and Medical Emergency Services",
      contact: {
        phone: "199 (Emergency)",
        email: "emergency@gov.ng"
      },
      address: {
        street: "Various Locations",
        city: "Nationwide",
        state: "All States"
      },
      operating_hours: "24/7",
      services: ["Police", "Fire Service", "Ambulance", "Emergency Response"]
    }
  ];

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLocations(mockLocations);
      setServices(mockServices);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case "office": return "bg-blue-100 text-blue-800";
      case "warehouse": return "bg-orange-100 text-orange-800";
      case "field": return "bg-green-100 text-green-800";
      case "partner": return "bg-purple-100 text-purple-800";
      case "vendor": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getServiceCategoryIcon = (category: string) => {
    switch (category) {
      case "restaurant": return <Utensils className="w-4 h-4" />;
      case "hotel": return <Building2 className="w-4 h-4" />;
      case "transport": return <Car className="w-4 h-4" />;
      case "medical": return <Phone className="w-4 h-4" />;
      case "emergency": return <Phone className="w-4 h-4 text-red-600" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const filteredLocations = locations.filter((location: any) => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || location.type === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredServices = services.filter((service: any) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.services.some((s: any) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || service.category === selectedType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 lg:p-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Directory</h1>
            <p className="text-gray-600">Find office locations and service providers</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i: any) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:p-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Directory
          </h1>
          <p className="text-gray-600">Find office locations and service providers</p>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex gap-1">
          <Button
            variant={activeTab === "locations" ? "default" : "ghost"}
            onClick={() => setActiveTab("locations")}
            className="flex-1"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Office Locations
          </Button>
          <Button
            variant={activeTab === "services" ? "default" : "ghost"}
            onClick={() => setActiveTab("services")}
            className="flex-1"
          >
            <Coffee className="w-4 h-4 mr-2" />
            Service Providers
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={activeTab === "locations" ? "Search locations..." : "Search services..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              {activeTab === "locations" ? (
                <>
                  <option value="office">Offices</option>
                  <option value="warehouse">Warehouses</option>
                  <option value="field">Field Offices</option>
                  <option value="partner">Partners</option>
                  <option value="vendor">Vendors</option>
                </>
              ) : (
                <>
                  <option value="restaurant">Restaurants</option>
                  <option value="hotel">Hotels</option>
                  <option value="transport">Transport</option>
                  <option value="medical">Medical</option>
                  <option value="emergency">Emergency</option>
                  <option value="other">Other</option>
                </>
              )}
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      {activeTab === "locations" ? (
        /* Locations */
        <div className="space-y-4">
          {filteredLocations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredLocations.map((location: any) => (
              <Card key={location.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        {location.name}
                        <Badge className={getLocationTypeColor(location.type)}>
                          {location.type}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-1 text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        {location.address.street}, {location.address.city}, {location.address.state}
                      </div>
                    </div>
                    {location.coordinates && (
                      <Button size="sm" variant="outline">
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Contact Information */}
                    <div>
                      <h4 className="font-medium mb-2">Contact</h4>
                      <div className="space-y-1 text-sm">
                        {location.contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <a href={`tel:${location.contact.phone}`} className="hover:text-blue-600">
                              {location.contact.phone}
                            </a>
                          </div>
                        )}
                        {location.contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <a href={`mailto:${location.contact.email}`} className="hover:text-blue-600">
                              {location.contact.email}
                            </a>
                          </div>
                        )}
                        {location.contact.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-gray-500" />
                            <a href={location.contact.website} target="_blank" rel="noopener noreferrer"
                               className="hover:text-blue-600">
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Office Hours */}
                    {location.office_hours && (
                      <div>
                        <h4 className="font-medium mb-2">Office Hours</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(location.office_hours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}:</span>
                              <span>{hours}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Facilities */}
                    <div>
                      <h4 className="font-medium mb-2">Facilities</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Parking:</span>
                          <span>{location.facilities.parking ? "✓" : "✗"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Restaurant:</span>
                          <span>{location.facilities.restaurant ? "✓" : "✗"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conference Rooms:</span>
                          <span>{location.facilities.conference_rooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>WiFi:</span>
                          <span>{location.facilities.wifi ? "✓" : "✗"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Generator:</span>
                          <span>{location.facilities.generator ? "✓" : "✗"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Contact */}
                  {location.primary_contact && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Primary Contact</h4>
                      <div className="text-sm">
                        <div className="font-medium">{location.primary_contact.name}</div>
                        <div className="text-gray-600">{location.primary_contact.title}</div>
                        {location.primary_contact.phone && (
                          <div className="mt-1">
                            <a href={`tel:${location.primary_contact.phone}`} className="text-blue-600 hover:underline">
                              {location.primary_contact.phone}
                            </a>
                          </div>
                        )}
                        {location.primary_contact.email && (
                          <div>
                            <a href={`mailto:${location.primary_contact.email}`} className="text-blue-600 hover:underline">
                              {location.primary_contact.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {location.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-700">{location.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Service Providers */
        <div className="space-y-4">
          {filteredServices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredServices.map((service: any) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getServiceCategoryIcon(service.category)}
                        {service.name}
                        <Badge variant="outline">{service.category}</Badge>
                        {service.rating && (
                          <Badge variant="secondary">★ {service.rating}</Badge>
                        )}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{service.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact & Address */}
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <a href={`tel:${service.contact.phone}`} className="hover:text-blue-600">
                            {service.contact.phone}
                          </a>
                        </div>
                        {service.contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <a href={`mailto:${service.contact.email}`} className="hover:text-blue-600">
                              {service.contact.email}
                            </a>
                          </div>
                        )}
                        {service.contact.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-gray-500" />
                            <a href={service.contact.website} target="_blank" rel="noopener noreferrer"
                               className="hover:text-blue-600">
                              Website
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span>{service.address.street}, {service.address.city}, {service.address.state}</span>
                        </div>
                        {service.operating_hours && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span>{service.operating_hours}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <h4 className="font-medium mb-2">Services Offered</h4>
                      <div className="flex flex-wrap gap-1">
                        {service.services.map((serviceItem, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {serviceItem}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}