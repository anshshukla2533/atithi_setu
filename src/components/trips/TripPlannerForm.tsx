import { useState } from "react"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { Calendar as CalendarIcon, MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { Checkpoint } from "@/types/trip"

export function TripPlannerForm() {
  const { toast } = useToast()
  const [checkpoints, setCheckpoints] = useState<Partial<Checkpoint>[]>([])
  const [date, setDate] = useState<Date>()

  const form = useForm({
    defaultValues: {
      title: "",
      // add other default fields as needed
    },
  })

  const addCheckpoint = () => {
    setCheckpoints([...checkpoints, {
      type: 'checkpoint',
      status: 'pending',
      requiresCheck: true
    }])
  }

  const removeCheckpoint = (index: number) => {
    setCheckpoints(checkpoints.filter((_, i) => i !== index))
  }

  const onSubmit = (data: any) => {
    toast({
      title: "Trip Created",
      description: "Your trip has been created successfully.",
    })
    // handle form data here
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Plan Your Trip</CardTitle>
            <CardDescription>
              Create your travel itinerary with safety checkpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Trip Details */}
            <div className="space-y-4">
              <FormField
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer Vacation 2025" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of your trip"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Checkpoints */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Checkpoints</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCheckpoint}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Checkpoint
                </Button>
              </div>

              {checkpoints.map((checkpoint, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          name={`checkpoints.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Hotel/Landmark" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          name={`checkpoints.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="checkpoint">Checkpoint</SelectItem>
                                  <SelectItem value="destination">Destination</SelectItem>
                                  <SelectItem value="accommodation">Accommodation</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        name={`checkpoints.${index}.address`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Full address" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          name={`checkpoints.${index}.expectedArrivalTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Arrival</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          name={`checkpoints.${index}.expectedDepartureTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Departure</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCheckpoint(index)}
                      >
                        Remove Checkpoint
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Privacy Settings */}
            <FormField
              name="privacyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="authorities">Authorities Access</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose who can see your trip details and location updates
                  </FormDescription>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Create Trip
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}